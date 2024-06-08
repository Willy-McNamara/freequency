/* this may need to move into /src to access the PrismaClient, moving here for organized storage / record keeping */

import { PrismaClient } from '@prisma/client';

const { config } = require('dotenv');

// Load environment variables from .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function updateSessions() {
  try {
    await prisma.session.updateMany({
      data: {
        instruments: [],
      },
    });
  } catch (error) {
    console.error('Error updating sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the function to update sessions
updateSessions();
