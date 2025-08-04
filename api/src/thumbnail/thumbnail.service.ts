import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import ffmpeg from 'ffmpeg-static';

const execAsync = promisify(exec);

@Injectable()
export class ThumbnailService {
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

  async generateVideoThumbnail(videoUrl: string): Promise<string> {
    try {
      // Generate unique filenames
      const timestamp = Date.now();
      const tempVideoPath = `/tmp/${timestamp}_video.mp4`;
      const tempThumbPath = `/tmp/${timestamp}_thumb.jpg`;

      // Download video from S3 to temp file
      await this.downloadFromS3(videoUrl, tempVideoPath);

      // Generate thumbnail with ffmpeg (preserve aspect ratio)
      const ffmpegCommand = `"${ffmpeg}" -i ${tempVideoPath} -ss 00:00:01 -vframes 1 -vf scale=320:-1 -q:v 3 -f image2 ${tempThumbPath}`;
      await execAsync(ffmpegCommand);

      // Upload thumbnail to S3
      const thumbnailUrl = await this.uploadThumbnailToS3(
        tempThumbPath,
        timestamp,
      );

      // Clean up temp files
      this.cleanupTempFiles(tempVideoPath, tempThumbPath);

      return thumbnailUrl;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Clean up any temp files that might exist
      this.cleanupTempFiles(
        `/tmp/${Date.now()}_video.mp4`,
        `/tmp/${Date.now()}_thumb.jpg`,
      );
      throw new Error('Failed to generate video thumbnail');
    }
  }

  private async downloadFromS3(
    s3Url: string,
    localPath: string,
  ): Promise<void> {
    try {
      // Use curl to download from S3
      const curlCommand = `curl -o ${localPath} "${s3Url}"`;
      await execAsync(curlCommand);
    } catch (error) {
      console.error('Error downloading from S3:', error);
      throw error;
    }
  }

  private async uploadThumbnailToS3(
    localPath: string,
    timestamp: number,
  ): Promise<string> {
    try {
      const thumbnailKey = `thumbnails/${timestamp}_thumb.jpg`;
      const fileBuffer = fs.readFileSync(localPath);

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: thumbnailKey,
        Body: fileBuffer,
        ContentType: 'image/jpeg',
      });

      await this.s3Client.send(putObjectCommand);

      return `https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/${thumbnailKey}`;
    } catch (error) {
      console.error('Error uploading thumbnail to S3:', error);
      throw error;
    }
  }

  private cleanupTempFiles(...filePaths: string[]): void {
    filePaths.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error cleaning up temp file ${filePath}:`, error);
      }
    });
  }
}
