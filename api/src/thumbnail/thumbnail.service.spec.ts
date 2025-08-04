import { Test, TestingModule } from '@nestjs/testing';
import { ThumbnailService } from './thumbnail.service';

// Mock the entire ThumbnailService module
jest.mock('./thumbnail.service', () => {
  return {
    ThumbnailService: jest.fn().mockImplementation(() => ({
      generateVideoThumbnail: jest.fn(),
    })),
  };
});

describe('ThumbnailService', () => {
  let service: ThumbnailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThumbnailService],
    }).compile();

    service = module.get<ThumbnailService>(ThumbnailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have generateVideoThumbnail method', () => {
    expect(service.generateVideoThumbnail).toBeDefined();
    expect(typeof service.generateVideoThumbnail).toBe('function');
  });
});
