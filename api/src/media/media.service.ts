import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FrontendMedia, MediaItem, MediaType } from './media.dto';
import { ThumbnailService } from '../thumbnail/thumbnail.service';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private thumbnailService: ThumbnailService,
  ) {}
  async addMediaItem(
    fileName: string,
    musicianId,
    type: MediaType,
    sessionId: number,
    displayName?: string,
    thumbnailUrl?: string,
  ): Promise<MediaItem> {
    const videoUrl =
      'https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/' + fileName;

    // Use provided thumbnailUrl or generate one for videos
    let finalThumbnailUrl: string | null = null;
    if (type === 'video') {
      if (thumbnailUrl) {
        // Use the provided thumbnail URL (from server-side upload)
        finalThumbnailUrl = thumbnailUrl;
      } else {
        // Generate thumbnail (for client-side uploads)
        try {
          finalThumbnailUrl =
            await this.thumbnailService.generateVideoThumbnail(videoUrl);
        } catch (error) {
          console.error('Failed to generate thumbnail:', error);
          // Continue without thumbnail - frontend will show video icon
        }
      }
    }

    const newMedia = await this.prisma.media.create({
      data: {
        musicianId: musicianId,
        url: videoUrl,
        type: type,
        sessionId: sessionId,
        displayName: displayName,
        thumbnailUrl: finalThumbnailUrl,
      },
    });

    const formattedMediaItem: MediaItem = {
      id: newMedia.id,
      musicianId: newMedia.musicianId,
      url: newMedia.url,
      type: newMedia.type as MediaType,
      displayName: newMedia.displayName,
      thumbnailUrl: newMedia.thumbnailUrl,
    };

    return formattedMediaItem;
  }

  async connectMediaToSession(
    mediaId: number,
    sessionId: number,
  ): Promise<FrontendMedia> {
    // verify media exists
    const media = await this.prisma.media.findUnique({
      where: {
        id: mediaId,
      },
    });

    if (!media) {
      return;
    }

    const updatedSession = await this.prisma.session.update({
      where: {
        id: sessionId,
      },
      data: {
        media: {
          connect: {
            id: mediaId,
          },
        },
      },
    });

    if (!updatedSession) return;

    return {
      url: media.url,
      type: media.type as MediaType,
      displayName: media.displayName,
      thumbnailUrl: media.thumbnailUrl,
    };
  }
}
