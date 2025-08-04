import { MiddlewareConsumer, Module, NestModule, Logger } from '@nestjs/common';
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
import { join } from 'path';
import { MusiciansService } from './musicians/musicians.service';
import { SessionsService } from './sessions/sessions.service';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { UnauthorizedExceptionFilter } from './filters/unauthorized-exception.filter';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtService, JwtModule } from '@nestjs/jwt';

import { S3Module } from './s3/s3.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { InstrumentsController } from './instruments/instruments.controller';
import { TagsController } from './tags/tags.controller';
import { LoggingModule } from './logging/logging.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
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
        limit: 60,
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
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
