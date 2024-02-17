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

@Module({
  imports: [
    PrismaModule,
    SessionsModule,
    MusiciansModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../../frontend/dist'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, MusiciansService, SessionsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
