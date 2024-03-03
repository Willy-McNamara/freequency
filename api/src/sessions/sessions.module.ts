import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, JwtService],
  imports: [PrismaModule],
})
export class SessionsModule {}
