import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FrontendMedia, MediaItem, MediaType } from './media.dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}
  async addMediaItem(
    fileName: string,
    musicianId,
    type: MediaType,
    sessionId: number,
  ): Promise<MediaItem> {
    const newMedia = await this.prisma.media.create({
      data: {
        musicianId: musicianId,
        url:
          'https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/' +
          fileName,
        type: type,
        sessionId: sessionId,
      },
    });

    const formattedMediaItem: MediaItem = {
      id: newMedia.id,
      musicianId: newMedia.musicianId,
      url: newMedia.url,
      type: newMedia.type as MediaType,
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
    };
  }
}
