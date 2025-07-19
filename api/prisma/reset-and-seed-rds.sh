#!/bin/bash

# Usage: ./reset-and-seed-rds.sh <DATABASE_URL>
# Example: ./reset-and-seed-rds.sh "postgresql://user:pass@host:5432/dbname"

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <DATABASE_URL>"
  exit 1
fi

export DATABASE_URL_V3="$1"

cd "$(dirname "$0")/.."

echo "Resetting and seeding database at $DATABASE_URL_V3"
npx prisma migrate reset --schema=prisma/schema.prisma --force

echo "Done."