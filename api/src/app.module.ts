import { MiddlewareConsumer, Module, NestModule, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { MusiciansModule } from './musicians/musicians.module';
import { TasksModule } from './tasks/tasks.module';
import { MediaModule } from './media/media.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerMiddleware } from './logger.middleware';
import { SecurityMiddleware } from './security.middleware';
import { join } from 'path';
import { MusiciansService } from './musicians/musicians.service';
import { SessionsService } from './sessions/sessions.service';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { UnauthorizedExceptionFilter } from './filters/unauthorized-exception.filter';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { SecurityInterceptor } from './interceptors/security.interceptor';
import { SharedModule } from './shared/shared.module';

import { S3Module } from './s3/s3.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './guards/throttler.guard';
import { InstrumentsController } from './instruments/instruments.controller';
import { TagsController } from './tags/tags.controller';
import { LoggingModule } from './logging/logging.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { JwtAuthGuard } from './auth/jwt.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule, // Import the shared module
    PrismaModule,
    SessionsModule,
    MusiciansModule,
    TasksModule,
    MediaModule,
    ThumbnailModule,
    S3Module,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '../frontend/dist'),
      serveRoot: '/',
    }),
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '90m' },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100, // General rate limit
      },
      {
        ttl: 60,
        limit: 10, // Stricter limit for auth endpoints
        name: 'auth',
      },
      {
        ttl: 60,
        limit: 30, // Moderate limit for API endpoints
        name: 'api',
      },
    ]),
    LoggingModule,
    TerminusModule,
  ],
  controllers: [
    AppController,
    InstrumentsController,
    TagsController,
    HealthController,
  ],
  providers: [
    AppService,
    MusiciansService,
    SessionsService,
    JwtStrategy,
    JwtService,
    Logger,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityMiddleware, LoggerMiddleware).forRoutes('*');
  }
}
