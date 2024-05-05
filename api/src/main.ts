import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  config({ path: '.env.local' }); // since git issue with .env, this workaround to use .env.local
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  //app.useGlobalFilters(new AllExceptionsFilter(app.get(HttpAdapterHost)));
  await app.listen(3000);
}
bootstrap();
