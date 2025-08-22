import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { S3Service } from '../s3/s3.service';
import { MediaService } from '../media/media.service';
import { FileSecurityService } from '../services/file-security.service';
import { CSRFGuard } from '../guards/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('SessionsController', () => {
  let controller: SessionsController;
  let sessionsService: jest.Mocked<SessionsService>;
  let s3Service: jest.Mocked<S3Service>;
  let mediaService: jest.Mocked<MediaService>;

  const mockSessionsService = {
    getSession: jest.fn(),
    getSessionsWithFilters: jest.fn(),
    getFollowedUserIds: jest.fn(),
    createSession: jest.fn(),
    addComment: jest.fn(),
    addGasUp: jest.fn(),
  };

  const mockS3Service = {
    getSignedURL: jest.fn(),
    uploadFile: jest.fn(),
  };

  const mockMediaService = {
    addMediaItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: mockSessionsService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
        {
          provide: FileSecurityService,
          useValue: {
            validateFile: jest.fn().mockResolvedValue({
              isValid: true,
              isSafe: true,
              errors: [],
              fileType: 'image/jpeg',
              fileCategory: 'image',
            }),
            generateChecksum: jest.fn().mockReturnValue('mock-checksum'),
            logSecurityEvent: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(CSRFGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SessionsController>(SessionsController);
    sessionsService = module.get(SessionsService);
    s3Service = module.get(S3Service);
    mediaService = module.get(MediaService);

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSignedUrl', () => {
    const mockReq = {
      user: { id: 123 },
    };

    it('should return signed URL for valid file', async () => {
      const body = {
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg',
        fileName: 'test-image.jpg',
      };

      s3Service.getSignedURL.mockResolvedValue('https://signed-url.com');

      const result = await controller.getSignedUrl(body, mockReq);

      expect(s3Service.getSignedURL).toHaveBeenCalledWith(
        {
          size: 1024 * 1024,
          type: 'image/jpeg',
          musicianId: 123,
        },
        'test-image.jpg',
      );
      expect(result).toEqual({ signedUrl: 'https://signed-url.com' });
    });

    it('should throw error for file size limit exceeded', async () => {
      const body = {
        size: 15 * 1024 * 1024, // 15MB
        type: 'image/jpeg',
        fileName: 'large-image.jpg',
      };

      s3Service.getSignedURL.mockResolvedValue(
        'File size exceeds limit of 10MB',
      );

      await expect(controller.getSignedUrl(body, mockReq)).rejects.toThrow(
        'File size exceeds limit of 10MB',
      );
    });

    it('should throw error for unsupported file type', async () => {
      const body = {
        size: 1024 * 1024,
        type: 'application/pdf',
        fileName: 'document.pdf',
      };

      s3Service.getSignedURL.mockResolvedValue('File type not accepted');

      await expect(controller.getSignedUrl(body, mockReq)).rejects.toThrow(
        'File type not accepted',
      );
    });
  });

  describe('connectMedia', () => {
    const mockReq = {
      user: { id: 123 },
    };

    const mockSession = {
      id: 456,
      title: 'Test Session',
      notes: 'Test Notes',
      duration: 30,
      isPublic: true,
      createdAt: new Date(),
      musicianId: 123,
      gasUps: [],
      comments: [],
      instruments: [],
      tags: [],
      media: [{ type: 'image' }, { type: 'image' }, { type: 'audio' }],
      tasksInUse: [],
      tasks: [],
      musician: { id: 123, displayName: 'Test User', avatarUrl: null },
    } as any;

    beforeEach(() => {
      sessionsService.getSession.mockResolvedValue(mockSession);
    });

    it('should connect image media successfully', async () => {
      const body = {
        fileName: 'test-image.jpg',
        sessionId: 456,
        displayName: 'Test Image',
      };

      const mockMediaItem = {
        id: 1,
        musicianId: 123,
        url: 'https://example.com/test-image.jpg',
        type: 'image',
        displayName: 'Test Image',
        thumbnailUrl: null,
      } as any;

      mediaService.addMediaItem.mockResolvedValue(mockMediaItem);

      const result = await controller.connectMedia(body, mockReq);

      expect(sessionsService.getSession).toHaveBeenCalledWith(456);
      expect(mediaService.addMediaItem).toHaveBeenCalledWith(
        'test-image.jpg',
        123,
        'image',
        456,
        'Test Image',
        undefined,
      );
      expect(result).toEqual(mockMediaItem);
    });

    it('should connect video media with thumbnail', async () => {
      const body = {
        fileName: 'test-video.mp4',
        sessionId: 456,
        displayName: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      };

      const mockMediaItem = {
        id: 2,
        musicianId: 123,
        url: 'https://example.com/test-video.mp4',
        type: 'video',
        displayName: 'Test Video',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      } as any;

      mediaService.addMediaItem.mockResolvedValue(mockMediaItem);

      const result = await controller.connectMedia(body, mockReq);

      expect(mediaService.addMediaItem).toHaveBeenCalledWith(
        'test-video.mp4',
        123,
        'video',
        456,
        'Test Video',
        'https://example.com/thumbnail.jpg',
      );
      expect(result).toEqual(mockMediaItem);
    });

    it('should throw error for unsupported file type', async () => {
      const body = {
        fileName: 'document.pdf',
        sessionId: 456,
      };

      await expect(controller.connectMedia(body, mockReq)).rejects.toThrow(
        'Unsupported file type',
      );
    });

    it('should throw error when photo limit exceeded', async () => {
      const sessionWithMaxPhotos = {
        ...mockSession,
        media: [
          { type: 'image' },
          { type: 'image' },
          { type: 'image' },
          { type: 'image' },
        ],
      };

      sessionsService.getSession.mockResolvedValue(sessionWithMaxPhotos);

      const body = {
        fileName: 'another-image.jpg',
        sessionId: 456,
      };

      await expect(controller.connectMedia(body, mockReq)).rejects.toThrow(
        'Maximum 4 photos allowed per session',
      );
    });

    it('should throw error when audio limit exceeded', async () => {
      const sessionWithMaxAudio = {
        ...mockSession,
        media: [{ type: 'audio' }, { type: 'audio' }, { type: 'audio' }],
      };

      sessionsService.getSession.mockResolvedValue(sessionWithMaxAudio);

      const body = {
        fileName: 'another-audio.mp3',
        sessionId: 456,
      };

      await expect(controller.connectMedia(body, mockReq)).rejects.toThrow(
        'Maximum 3 audio recordings allowed per session',
      );
    });

    it('should throw error when video limit exceeded', async () => {
      const sessionWithVideo = {
        ...mockSession,
        media: [{ type: 'video' }],
      };

      sessionsService.getSession.mockResolvedValue(sessionWithVideo);

      const body = {
        fileName: 'another-video.mp4',
        sessionId: 456,
      };

      await expect(controller.connectMedia(body, mockReq)).rejects.toThrow(
        'Maximum 1 video allowed per session',
      );
    });
  });

  describe('uploadMedia', () => {
    const mockReq = {
      user: { id: 123 },
    };

    const mockFile = {
      originalname: 'test-video.mp4',
      mimetype: 'video/mp4',
      buffer: Buffer.from('test video content'),
    } as any;

    const mockSession = {
      id: 456,
      title: 'Test Session',
      notes: 'Test Notes',
      duration: 30,
      isPublic: true,
      createdAt: new Date(),
      musicianId: 123,
      gasUps: [],
      comments: [],
      instruments: [],
      tags: [],
      media: [{ type: 'image' }, { type: 'audio' }],
      tasksInUse: [],
      tasks: [],
      musician: { id: 123, displayName: 'Test User', avatarUrl: null },
    } as any;

    it('should upload video file successfully', async () => {
      const body = {
        sessionId: '456',
      };

      const uploadResult = {
        url: 'https://example.com/test-video.mp4',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      };

      const mockMediaItem = {
        id: 1,
        musicianId: 123,
        url: 'https://example.com/test-video.mp4',
        type: 'video',
        displayName: undefined,
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      } as any;

      // Mock a session without any videos
      const sessionWithoutVideo = {
        ...mockSession,
        media: [{ type: 'image' }, { type: 'audio' }],
      };
      sessionsService.getSession.mockResolvedValue(sessionWithoutVideo);

      s3Service.uploadFile.mockResolvedValue(uploadResult);
      mediaService.addMediaItem.mockResolvedValue(mockMediaItem);

      const result = await controller.uploadMedia(mockFile, body, mockReq);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        mockFile.buffer,
        expect.stringMatching(/media\/123\/\d+\.mp4/),
        'video/mp4',
        123,
      );
      expect(mediaService.addMediaItem).toHaveBeenCalledWith(
        expect.stringMatching(/media\/123\/\d+\.mp4/),
        123,
        'video',
        456,
        undefined,
        undefined,
      );
      expect(result).toEqual({
        url: 'https://example.com/test-video.mp4',
        fileName: expect.stringMatching(/media\/123\/\d+\.mp4/),
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
      });
    });

    it('should upload image file without connecting to session', async () => {
      const body = {}; // No sessionId

      const uploadResult = {
        url: 'https://example.com/test-image.jpg',
        thumbnailUrl: undefined,
      };

      s3Service.uploadFile.mockResolvedValue(uploadResult);

      const result = await controller.uploadMedia(mockFile, body, mockReq);

      expect(s3Service.uploadFile).toHaveBeenCalled();
      expect(mediaService.addMediaItem).not.toHaveBeenCalled();
      expect(result).toEqual({
        url: 'https://example.com/test-image.jpg',
        fileName: expect.stringMatching(/media\/123\/\d+\.mp4/),
        thumbnailUrl: undefined,
      });
    });

    it('should handle upload errors', async () => {
      const body = {
        sessionId: '456',
      };

      s3Service.uploadFile.mockRejectedValue(new Error('Upload failed'));

      await expect(
        controller.uploadMedia(mockFile, body, mockReq),
      ).rejects.toThrow('Upload failed');
    });
  });
});
