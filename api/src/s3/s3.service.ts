// s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AudioPayload } from 'src/sessions/dto/session.dto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_S3_DEV_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_DEV_SECRET_ACCESS_KEY!,
      },
    });
  }

  async getSignedURL(
    audioPayload: AudioPayload,
    fileName: string,
  ): Promise<string> {
    const maxFileSize = 200001; // 10 MB
    if (audioPayload.size > maxFileSize) {
      return 'File size not accepted';
    }

    const acceptedFileTypes = ['audio/webm;codecs=opus'];
    if (!acceptedFileTypes.includes(audioPayload.type)) {
      return 'File type not accepted';
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      ContentType: audioPayload.type,
      ContentLength: audioPayload.size,
      ChecksumSHA256: audioPayload.checksum,
      Metadata: {
        musicianId: audioPayload.musicianId.toString(),
      },
    });

    const url = await getSignedUrl(
      this.s3Client,
      putObjectCommand,
      { expiresIn: 60 }, // 60 seconds
    ).catch((err) => {
      console.error('Error getting signed URL:', err);
      return '';
    });

    return url;
  }

  // You can add more S3 methods here based on your needs
}
