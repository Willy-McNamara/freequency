// script for migrations, gets around my .env / .env/local issue
const { config } = require('dotenv');
const { execSync } = require('child_process');

// Load environment variables from .env.local
config({ path: '.env.local' });

// name this migration
const migrationName = 'profile-updates-march-2-24';
execSync(`npx prisma migrate dev --name ${migrationName}`, {
  stdio: 'inherit',
});

// uncomment the Prisma command you want to execute
/*
execSync(`npx prisma migrate dev --name ${migrationName}`, { stdio: 'inherit' });
execSync(`npx prisma migrate up --experimental`, { stdio: 'inherit' });
*/
