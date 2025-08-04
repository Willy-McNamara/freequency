import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { MediaType } from './media.dto';

describe('MediaService', () => {
  let service: MediaService;
  let prismaService: jest.Mocked<PrismaService>;
  let thumbnailService: jest.Mocked<ThumbnailService>;

  const mockPrismaService = {
    media: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    session: {
      update: jest.fn(),
    },
  };

  const mockThumbnailService = {
    generateVideoThumbnail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ThumbnailService,
          useValue: mockThumbnailService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prismaService = module.get(PrismaService);
    thumbnailService = module.get(ThumbnailService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('addMediaItem', () => {
    const mockMediaData = {
      id: 1,
      musicianId: 123,
      url: 'https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/media/123/test.jpg',
      type: 'image' as MediaType,
      sessionId: 456,
      displayName: 'Test Image',
      thumbnailUrl: null,
    };

    it('should create a media item for an image without thumbnail', async () => {
      (prismaService.media.create as jest.Mock).mockResolvedValue(
        mockMediaData,
      );

      const result = await service.addMediaItem(
        'media/123/test.jpg',
        123,
        'image',
        456,
        'Test Image',
      );

      expect(prismaService.media.create).toHaveBeenCalledWith({
        data: {
          musicianId: 123,
          url: 'https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/media/123/test.jpg',
          type: 'image',
          sessionId: 456,
          displayName: 'Test Image',
          thumbnailUrl: null,
        },
      });

      expect(result).toEqual({
        id: 1,
        musicianId: 123,
        url: 'https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/media/123/test.jpg',
        type: 'image',
        displayName: 'Test Image',
        thumbnailUrl: null,
      });
    });

    it('should create a video media item with provided thumbnail URL', async () => {
      const mockVideoData = {
        ...mockMediaData,
        type: 'video' as MediaType,
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      };

      (prismaService.media.create as jest.Mock).mockResolvedValue(
        mockVideoData,
      );

      const result = await service.addMediaItem(
        'media/123/test.mp4',
        123,
        'video',
        456,
        'Test Video',
        'https://example.com/thumbnail.jpg',
      );

      expect(prismaService.media.create).toHaveBeenCalledWith({
        data: {
          musicianId: 123,
          url: 'https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/media/123/test.mp4',
          type: 'video',
          sessionId: 456,
          displayName: 'Test Video',
          thumbnailUrl: 'https://example.com/thumbnail.jpg',
        },
      });

      expect(result.thumbnailUrl).toBe('https://example.com/thumbnail.jpg');
    });

    it('should generate thumbnail for video when no thumbnail URL is provided', async () => {
      const mockVideoData = {
        ...mockMediaData,
        type: 'video' as MediaType,
        thumbnailUrl: 'https://generated-thumbnail.jpg',
      };

      (thumbnailService.generateVideoThumbnail as jest.Mock).mockResolvedValue(
        'https://generated-thumbnail.jpg',
      );
      (prismaService.media.create as jest.Mock).mockResolvedValue(
        mockVideoData,
      );

      const result = await service.addMediaItem(
        'media/123/test.mp4',
        123,
        'video',
        456,
        'Test Video',
      );

      expect(thumbnailService.generateVideoThumbnail).toHaveBeenCalledWith(
        'https://freequency-music-app-dev.s3.us-east-2.amazonaws.com/media/123/test.mp4',
      );

      expect(result.thumbnailUrl).toBe('https://generated-thumbnail.jpg');
    });

    it('should handle thumbnail generation errors gracefully', async () => {
      const mockVideoData = {
        ...mockMediaData,
        type: 'video' as MediaType,
        thumbnailUrl: null,
      };

      (thumbnailService.generateVideoThumbnail as jest.Mock).mockRejectedValue(
        new Error('FFmpeg error'),
      );
      (prismaService.media.create as jest.Mock).mockResolvedValue(
        mockVideoData,
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.addMediaItem(
        'media/123/test.mp4',
        123,
        'video',
        456,
        'Test Video',
      );

      expect(thumbnailService.generateVideoThumbnail).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to generate thumbnail:',
        expect.any(Error),
      );
      expect(result.thumbnailUrl).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should not generate thumbnail for non-video media types', async () => {
      (prismaService.media.create as jest.Mock).mockResolvedValue(
        mockMediaData,
      );

      await service.addMediaItem(
        'media/123/test.mp3',
        123,
        'audio',
        456,
        'Test Audio',
      );

      expect(thumbnailService.generateVideoThumbnail).not.toHaveBeenCalled();
    });

    it('should handle database creation errors', async () => {
      (prismaService.media.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.addMediaItem(
          'media/123/test.jpg',
          123,
          'image',
          456,
          'Test Image',
        ),
      ).rejects.toThrow('Database error');
    });
  });

  describe('connectMediaToSession', () => {
    const mockMedia = {
      id: 1,
      musicianId: 123,
      url: 'https://example.com/media.jpg',
      type: 'image' as MediaType,
      sessionId: null,
      displayName: 'Test Media',
      thumbnailUrl: null,
    };

    const mockSession = {
      id: 456,
      // ... other session properties
    };

    it('should connect existing media to a session', async () => {
      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(
        mockMedia,
      );
      (prismaService.session.update as jest.Mock).mockResolvedValue(
        mockSession,
      );

      const result = await service.connectMediaToSession(1, 456);

      expect(prismaService.media.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(prismaService.session.update).toHaveBeenCalledWith({
        where: { id: 456 },
        data: {
          media: {
            connect: { id: 1 },
          },
        },
      });

      expect(result).toEqual({
        url: 'https://example.com/media.jpg',
        type: 'image',
        displayName: 'Test Media',
        thumbnailUrl: null,
      });
    });

    it('should return undefined when media does not exist', async () => {
      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.connectMediaToSession(999, 456);

      expect(prismaService.media.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });

      expect(prismaService.session.update).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should return undefined when session update fails', async () => {
      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(
        mockMedia,
      );
      (prismaService.session.update as jest.Mock).mockResolvedValue(null);

      const result = await service.connectMediaToSession(1, 456);

      expect(result).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      (prismaService.media.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.connectMediaToSession(1, 456)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle session update errors gracefully', async () => {
      (prismaService.media.findUnique as jest.Mock).mockResolvedValue(
        mockMedia,
      );
      (prismaService.session.update as jest.Mock).mockRejectedValue(
        new Error('Session update error'),
      );

      await expect(service.connectMediaToSession(1, 456)).rejects.toThrow(
        'Session update error',
      );
    });
  });
});
