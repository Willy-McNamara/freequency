# Stage 1: Build the React app (frontend)
FROM node:20 AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy source code
COPY frontend ./

# Build with environment variables (can be overridden at build time)
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Build the backend
FROM node:20 AS backend-build

WORKDIR /app/api

COPY api/package.json api/package-lock.json ./
RUN npm install

COPY api ./

RUN npm run build

# Stage 3: Combine the built frontend and backend, and run the application
FROM node:20

WORKDIR /app

# Install AWS CLI for log uploads to S3
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# Copy backend dependencies and built backend code
COPY api/package.json api/package-lock.json ./
RUN npm install --only=production

COPY --from=backend-build /app/api/dist /app/api/dist

# Copy built frontend code to the expected location
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy database seed file to a known location
# swithing to RDS, so commenting out this step (for local db hosting)
# COPY db-backup/db_backup_6_29_24.sql /docker-entrypoint-initdb.d/seed.sql

# Copy Prisma schema and scripts
COPY api/prisma /app/api
COPY api/scripts/ /app/api/scripts/
RUN chmod +x /app/api/scripts/entrypoint.sh
RUN chmod +x /app/api/scripts/upload-logs-to-s3.sh

# Serve the frontend with the backend
EXPOSE 3000

ENTRYPOINT ["/app/api/scripts/entrypoint.sh"]

