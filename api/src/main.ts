import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { join } from 'path';

async function bootstrap() {
  config({ path: '.env.local' }); // since git issue with .env, this workaround to use .env.local
  const app = await NestFactory.create(AppModule);
  app.enableCors();
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
      req.url.startsWith('/vite.svg')
    ) {
      return next();
    }
    res.sendFile(join(process.cwd(), '../v3_frontend/dist/index.html'));
  });

  await app.listen(3000);
}
bootstrap();
