import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { existsSync } from 'fs';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  config();

  if (existsSync('.env.local')) {
    config({ path: '.env.local' }); // since git issue with .env, this workaround to use .env.local . Need for local development I think
  }

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://demo.freequencyapp.com',
    ], // Vite dev server + backend
    credentials: true, // Important for JWT cookies
  });
  app.use(cookieParser());
  //app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));

  // Serve React app for all non-API routes
  app.use((req, res, next) => {
    // Skip middleware for API routes, auth routes, and static assets
    if (
      req.url.startsWith('/api') ||
      req.url.startsWith('/auth') ||
      req.url.startsWith('/sessions') ||
      req.url.startsWith('/musicians') ||
      req.url.startsWith('/instruments') ||
      req.url.startsWith('/tags') ||
      req.url.startsWith('/tasks') ||
      req.url.startsWith('/assets') ||
      req.url.startsWith('/logo.svg') ||
      req.url.startsWith('/health') ||
      req.url.startsWith('/vite.svg')
    ) {
      return next();
    }
    res.sendFile(join(process.cwd(), '../frontend/dist/index.html'));
  });

  await app.listen(3000);
}
bootstrap();
