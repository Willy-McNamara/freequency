#!/bin/sh

# Start Redis in background with secure configuration
echo "🔴 Starting Redis with secure configuration..."
redis-server /etc/redis.conf --daemonize yes

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if redis-cli -a "${REDIS_PASSWORD:-default_password}" ping > /dev/null 2>&1; then
    echo "✅ Redis is ready and responding!"
    break
  fi

  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Redis failed to start after $max_attempts attempts!"
    echo "📋 Redis logs:"
    tail -n 20 /var/log/redis/redis-server.log 2>/dev/null || echo "No Redis logs found"
    exit 1
  fi

  echo "  Attempt $attempt/$max_attempts... waiting 2 seconds"
  sleep 2
  attempt=$((attempt + 1))
done

# Test Redis connection
echo "🔍 Testing Redis connection..."
if redis-cli -a "${REDIS_PASSWORD:-default_password}" ping | grep -q "PONG"; then
  echo "✅ Redis connection test successful!"
else
  echo "❌ Redis connection test failed!"
  exit 1
fi

# Start your app
echo "🚀 Starting Freequency app..."
cd /app/api
npm run start:prod
