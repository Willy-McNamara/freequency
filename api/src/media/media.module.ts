import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { ThumbnailModule } from '../thumbnail/thumbnail.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ThumbnailModule, PrismaModule],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
