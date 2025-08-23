# Stage 1: Build the React app (frontend)
FROM node:20 AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --only=production

# Copy source code (excluding test files via .dockerignore)
COPY frontend ./

# Build with environment variables (can be overridden at build time)
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Build the backend
FROM node:20 AS backend-build

WORKDIR /app/api

# Copy package files
COPY api/package.json api/package-lock.json ./
RUN npm ci

# Copy source code (excluding test files via .dockerignore)
COPY api ./

RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine

WORKDIR /app

# Install AWS CLI and Redis for log uploads and caching
RUN apk add --no-cache aws-cli redis

# Copy backend dependencies and built backend code
COPY api/package.json api/package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=backend-build /app/api/dist /app/api/dist

# Copy built frontend code to the expected location
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy only necessary Prisma files
COPY api/prisma/schema.prisma /app/api/prisma/
COPY api/scripts/ /app/api/scripts/
RUN chmod +x /app/api/scripts/entrypoint.sh
RUN chmod +x /app/api/scripts/upload-logs-to-s3.sh

# Create logs directory
RUN mkdir -p /app/logs

# Redis configuration will be handled by docker-compose

# Serve the frontend with the backend
EXPOSE 3000

ENTRYPOINT ["/app/api/scripts/entrypoint.sh"]

