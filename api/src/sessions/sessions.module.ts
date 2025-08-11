import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtService } from '@nestjs/jwt';
import { MediaModule } from 'src/media/media.module';
import { ThumbnailModule } from 'src/thumbnail/thumbnail.module';
import { S3Module } from 'src/s3/s3.module';
import { FileSecurityService } from '../services/file-security.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, JwtService, FileSecurityService],
  imports: [PrismaModule, MediaModule, ThumbnailModule, S3Module],
})
export class SessionsModule {}
