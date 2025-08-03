import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ThumbnailModule } from '../thumbnail/thumbnail.module';

@Module({
  imports: [ThumbnailModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
