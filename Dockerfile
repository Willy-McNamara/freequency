# Stage 1: Build the React app
FROM node:16 AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend ./
RUN npm run build

# Stage 2: Build the backend
FROM node:16 AS backend-build

WORKDIR /app/api

COPY api/package.json api/package-lock.json ./
RUN npm install

COPY api ./

RUN npm run build

# Stage 3: Combine the built frontend and backend, and run the application
FROM node:16

WORKDIR /app

# Copy backend dependencies and built backend code
COPY api/package.json api/package-lock.json ./
RUN npm install --only=production

COPY --from=backend-build /app/api/dist /app/api/dist

# Copy built frontend code to the expected location
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy database seed file to a known location
# swithing to RDS, so commenting out this step (for local db hosting)
# COPY db-backup/db_backup_6_29_24.sql /docker-entrypoint-initdb.d/seed.sql

# Copy Prisma schema and entrypoint script
COPY api/prisma /app/api
COPY api/scripts/entrypoint.sh /app/api/scripts/entrypoint.sh
RUN chmod +x /app/api/scripts/entrypoint.sh

# Serve the frontend with the backend
EXPOSE 3000


ENTRYPOINT ["/app/api/scripts/entrypoint.sh"]

