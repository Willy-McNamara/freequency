# Stage 1: Build the React app (v3_frontend)
FROM node:16 AS frontend-build

WORKDIR /app/v3_frontend

# Copy package files
COPY v3_frontend/package.json v3_frontend/package-lock.json ./
RUN npm install

# Copy source code
COPY v3_frontend ./

# Build with environment variables (can be overridden at build time)
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

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
COPY --from=frontend-build /app/v3_frontend/dist /app/frontend/dist

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

