#!/bin/sh

# Navigate to the API folder
cd /app/api

# Generate Prisma Client
npx prisma generate

# Wait for 5 seconds (optional, adjust as needed)
sleep 5

# Start the application
node dist/src/main