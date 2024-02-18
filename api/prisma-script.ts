// script for migrations, gets around my .env / .env/local issue
const { config } = require('dotenv');
const { execSync } = require('child_process');

// Load environment variables from .env.local
config({ path: '.env.local' });

// uncomment the Prisma command you want to execute
/*
execSync('npx prisma migrate dev', { stdio: 'inherit' });
execSync('npx prisma migrate deploy', { stdio: 'inherit' });
*/
