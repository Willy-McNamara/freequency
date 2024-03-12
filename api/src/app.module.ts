import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { MusiciansModule } from './musicians/musicians.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerMiddleware } from './logger.middleware';
import { join } from 'path';
import { MusiciansService } from './musicians/musicians.service';
import { SessionsService } from './sessions/sessions.service';
import { AuthModule } from './auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { UnauthorizedExceptionFilter } from './filters/unauthorized-exception.filter';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtService, JwtModule } from '@nestjs/jwt';
import { S3 } from '@aws-sdk/client-s3';
import { S3Service } from './s3/s3.service';

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    MusiciansModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../frontend/dist'),
    }),
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5m' },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MusiciansService,
    SessionsService,
    JwtStrategy,
    JwtService,
    S3Service,
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
