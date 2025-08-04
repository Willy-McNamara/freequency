import { Test, TestingModule } from '@nestjs/testing';
import { S3Service, FileUploadPayload } from './s3.service';
import { ThumbnailService } from '../thumbnail/thumbnail.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

const mockS3Client = {
  send: jest.fn(),
};

const mockPutObjectCommand = {
  // Mock constructor
};

const mockGetSignedUrl = getSignedUrl as jest.MockedFunction<
  typeof getSignedUrl
>;

describe('S3Service', () => {
  let service: S3Service;
  let thumbnailService: jest.Mocked<ThumbnailService>;

  const mockThumbnailService = {
    generateVideoThumbnail: jest.fn(),
  };

  beforeEach(async () => {
    // Reset environment variables
    process.env.AWS_BUCKET_REGION = 'us-east-2';
    process.env.AWS_S3_DEV_ACCESS_KEY = 'test-access-key';
    process.env.AWS_S3_DEV_SECRET_ACCESS_KEY = 'test-secret-key';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ThumbnailService,
          useValue: mockThumbnailService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    thumbnailService = module.get(ThumbnailService);

    // Clear all mocks
    jest.clearAllMocks();

    // Mock S3Client constructor
    (S3Client as jest.MockedClass<typeof S3Client>).mockImplementation(
      () => mockS3Client as any,
    );

    // Mock PutObjectCommand constructor
    (
      PutObjectCommand as jest.MockedClass<typeof PutObjectCommand>
    ).mockImplementation(() => mockPutObjectCommand as any);
  });

  describe('getSignedURL', () => {
    const validFilePayload: FileUploadPayload = {
      size: 1024 * 1024, // 1MB
      type: 'image/jpeg',
      musicianId: 123,
      checksum: 'test-checksum',
    };

    it('should generate signed URL for valid image file', async () => {
      mockGetSignedUrl.mockResolvedValue('https://signed-url.com');

      const result = await service.getSignedURL(
        validFilePayload,
        'test-image.jpg',
      );

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        { expiresIn: 60 },
      );
      expect(result).toBe('https://signed-url.com');
    });

    it('should generate signed URL for valid audio file', async () => {
      const audioPayload: FileUploadPayload = {
        ...validFilePayload,
        type: 'audio/mp3',
      };

      mockGetSignedUrl.mockResolvedValue('https://signed-url.com');

      const result = await service.getSignedURL(audioPayload, 'test-audio.mp3');

      expect(result).toBe('https://signed-url.com');
    });

    it('should generate signed URL for valid video file', async () => {
      const videoPayload: FileUploadPayload = {
        ...validFilePayload,
        type: 'video/mp4',
      };

      mockGetSignedUrl.mockResolvedValue('https://signed-url.com');

      const result = await service.getSignedURL(videoPayload, 'test-video.mp4');

      expect(result).toBe('https://signed-url.com');
    });

    it('should reject unsupported file types', async () => {
      const invalidPayload: FileUploadPayload = {
        ...validFilePayload,
        type: 'application/pdf',
      };

      const result = await service.getSignedURL(invalidPayload, 'test.pdf');

      expect(result).toBe('File type not accepted');
      expect(mockGetSignedUrl).not.toHaveBeenCalled();
    });

    it('should reject files exceeding size limits', async () => {
      const largeImagePayload: FileUploadPayload = {
        ...validFilePayload,
        size: 15 * 1024 * 1024, // 15MB (exceeds 10MB limit)
      };

      const result = await service.getSignedURL(
        largeImagePayload,
        'large-image.jpg',
      );

      expect(result).toBe('File size exceeds limit of 10MB');
      expect(mockGetSignedUrl).not.toHaveBeenCalled();
    });

    it('should reject large audio files', async () => {
      const largeAudioPayload: FileUploadPayload = {
        ...validFilePayload,
        type: 'audio/mp3',
        size: 60 * 1024 * 1024, // 60MB (exceeds 50MB limit)
      };

      const result = await service.getSignedURL(
        largeAudioPayload,
        'large-audio.mp3',
      );

      expect(result).toBe('File size exceeds limit of 50MB');
    });

    it('should reject large video files', async () => {
      const largeVideoPayload: FileUploadPayload = {
        ...validFilePayload,
        type: 'video/mp4',
        size: 60 * 1024 * 1024, // 60MB (exceeds 50MB limit)
      };

      const result = await service.getSignedURL(
        largeVideoPayload,
        'large-video.mp4',
      );

      expect(result).toBe('File size exceeds limit of 50MB');
    });

    it('should handle AWS SDK errors gracefully', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('AWS Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.getSignedURL(
        validFilePayload,
        'test-image.jpg',
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting signed URL:',
        expect.any(Error),
      );
      expect(result).toBe('');

      consoleSpy.mockRestore();
    });
  });

  describe('uploadFile', () => {
    const testBuffer = Buffer.from('test file content');
    const testFileName = 'test-file.jpg';
    const testContentType = 'image/jpeg';
    const testMusicianId = 123;

    it('should upload image file successfully', async () => {
      mockS3Client.send.mockResolvedValue({});

      const result = await service.uploadFile(
        testBuffer,
        testFileName,
        testContentType,
        testMusicianId,
      );

      expect(mockS3Client.send).toHaveBeenCalledWith(expect.any(Object));
      expect(result.url).toBe(
        'https://test-bucket.s3.us-east-2.amazonaws.com/test-file.jpg',
      );
      expect(result.thumbnailUrl).toBeUndefined();
    });

    it('should upload video file and generate thumbnail', async () => {
      mockS3Client.send.mockResolvedValue({});
      (thumbnailService.generateVideoThumbnail as jest.Mock).mockResolvedValue(
        'https://thumbnail-url.com',
      );

      const result = await service.uploadFile(
        testBuffer,
        'test-video.mp4',
        'video/mp4',
        testMusicianId,
      );

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(thumbnailService.generateVideoThumbnail).toHaveBeenCalledWith(
        'https://test-bucket.s3.us-east-2.amazonaws.com/test-video.mp4',
      );
      expect(result.thumbnailUrl).toBe('https://thumbnail-url.com');
    });

    it('should handle thumbnail generation errors gracefully', async () => {
      mockS3Client.send.mockResolvedValue({});
      (thumbnailService.generateVideoThumbnail as jest.Mock).mockRejectedValue(
        new Error('Thumbnail error'),
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.uploadFile(
        testBuffer,
        'test-video.mp4',
        'video/mp4',
        testMusicianId,
      );

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(thumbnailService.generateVideoThumbnail).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to generate video thumbnail:',
        expect.any(Error),
      );
      expect(result.thumbnailUrl).toBeUndefined();

      consoleSpy.mockRestore();
    });

    it('should not generate thumbnail for non-video files', async () => {
      mockS3Client.send.mockResolvedValue({});

      const result = await service.uploadFile(
        testBuffer,
        'test-audio.mp3',
        'audio/mp3',
        testMusicianId,
      );

      expect(mockS3Client.send).toHaveBeenCalled();
      expect(thumbnailService.generateVideoThumbnail).not.toHaveBeenCalled();
      expect(result.thumbnailUrl).toBeUndefined();
    });

    it('should handle S3 upload errors', async () => {
      mockS3Client.send.mockRejectedValue(new Error('S3 Upload Error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        service.uploadFile(
          testBuffer,
          testFileName,
          testContentType,
          testMusicianId,
        ),
      ).rejects.toThrow('Failed to upload file to S3');

      expect(consoleSpy).toHaveBeenCalledWith(
        'S3 upload error:',
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getFileCategory', () => {
    it('should categorize image files correctly', () => {
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      imageTypes.forEach((type) => {
        expect(service['getFileCategory'](type)).toBe('image');
      });
    });

    it('should categorize audio files correctly', () => {
      const audioTypes = [
        'audio/mp3',
        'audio/wav',
        'audio/m4a',
        'audio/ogg',
        'audio/webm',
      ];

      audioTypes.forEach((type) => {
        expect(service['getFileCategory'](type)).toBe('audio');
      });
    });

    it('should categorize video files correctly', () => {
      const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

      videoTypes.forEach((type) => {
        expect(service['getFileCategory'](type)).toBe('video');
      });
    });

    it('should throw error for unsupported file types', () => {
      const unsupportedTypes = [
        'application/pdf',
        'text/plain',
        'unknown/type',
      ];

      unsupportedTypes.forEach((type) => {
        expect(() => service['getFileCategory'](type)).toThrow(
          'Unsupported file type',
        );
      });
    });
  });

  describe('checkBucketHealth', () => {
    it('should return true when S3 is healthy', async () => {
      mockGetSignedUrl.mockResolvedValue('https://health-check-url.com');

      const result = await service.checkBucketHealth();

      expect(result).toBe(true);
      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(Object),
        { expiresIn: 1 },
      );
    });

    it('should throw error when S3 is unhealthy', async () => {
      mockGetSignedUrl.mockRejectedValue(new Error('S3 Connection Failed'));

      await expect(service.checkBucketHealth()).rejects.toThrow(
        'S3 health check failed: S3 Connection Failed',
      );
    });
  });
});
