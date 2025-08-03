// s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ThumbnailService } from '../thumbnail/thumbnail.service';

export interface FileUploadPayload {
  size: number;
  type: string;
  musicianId: number;
  checksum?: string;
}

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private thumbnailService: ThumbnailService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_BUCKET_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_S3_DEV_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_DEV_SECRET_ACCESS_KEY!,
      },
    });
  }

  async getSignedURL(
    filePayload: FileUploadPayload,
    fileName: string,
  ): Promise<string> {
    // File size limits (in bytes)
    const fileSizeLimits = {
      image: 10 * 1024 * 1024, // 10MB for images
      audio: 50 * 1024 * 1024, // 50MB for audio
      video: 50 * 1024 * 1024, // 50MB for video (1 minute max)
    };

    // Accepted file types
    const acceptedFileTypes = {
      image: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ],
      audio: [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp3',
        'audio/mpeg',
        'audio/wav',
        'audio/m4a',
        'audio/ogg',
      ],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
    };

    // Determine file category
    let fileCategory: 'image' | 'audio' | 'video' | null = null;
    for (const [category, types] of Object.entries(acceptedFileTypes)) {
      if (types.includes(filePayload.type)) {
        fileCategory = category as 'image' | 'audio' | 'video';
        break;
      }
    }

    if (!fileCategory) {
      return 'File type not accepted';
    }

    // Check file size
    const maxFileSize = fileSizeLimits[fileCategory];
    if (filePayload.size > maxFileSize) {
      return `File size exceeds limit of ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      ContentType: filePayload.type,
      ContentLength: filePayload.size,
      ChecksumSHA256: filePayload.checksum,
      Metadata: {
        musicianId: filePayload.musicianId.toString(),
        fileCategory: fileCategory,
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

  /**
   * Upload file directly to S3 from server-side
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    musicianId: number,
  ): Promise<{ url: string; thumbnailUrl?: string }> {
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: file,
      ContentType: contentType,
      Metadata: {
        musicianId: musicianId.toString(),
        fileCategory: this.getFileCategory(contentType),
      },
    });

    try {
      await this.s3Client.send(putObjectCommand);
      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${fileName}`;

      // Generate thumbnail for videos
      let thumbnailUrl: string | undefined;
      if (this.getFileCategory(contentType) === 'video') {
        try {
          thumbnailUrl =
            await this.thumbnailService.generateVideoThumbnail(url);
        } catch (error) {
          console.error('Failed to generate video thumbnail:', error);
          // Continue without thumbnail
        }
      }

      return { url, thumbnailUrl };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  private getFileCategory(contentType: string): 'image' | 'audio' | 'video' {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.startsWith('video/')) return 'video';
    throw new Error('Unsupported file type');
  }

  /**
   * Health check for S3 bucket - tests the actual functionality used by the app
   */
  async checkBucketHealth(): Promise<boolean> {
    try {
      // Test the same operation the app actually uses: generating a signed URL
      // This uses PutObjectCommand which you already have permissions for
      const testCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: 'health-check-test-file',
        ContentType: 'text/plain',
        ContentLength: 0,
      });

      // Generate a signed URL (this tests the actual S3 connectivity and permissions)
      await getSignedUrl(this.s3Client, testCommand, { expiresIn: 1 }); // 1 second expiry
      return true;
    } catch (err) {
      throw new Error(`S3 health check failed: ${err.message}`);
    }
  }
}
