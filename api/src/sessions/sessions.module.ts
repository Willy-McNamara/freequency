import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { S3Service } from 'src/s3/s3.service';
import { MediaService } from 'src/media/media.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, JwtService, S3Service, MediaService],
  imports: [PrismaModule],
})
export class SessionsModule {}
