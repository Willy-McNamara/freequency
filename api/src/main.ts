import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
  config({ path: '.env.local' }); // since git issue with .env, this workaround to use .env.local
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
