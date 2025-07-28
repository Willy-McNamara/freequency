import { Test, TestingModule } from '@nestjs/testing';
import { MusiciansService } from './musicians.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MusiciansService', () => {
  let service: MusiciansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusiciansService,
        {
          provide: PrismaService,
          useValue: {
            // Mock PrismaService methods as needed
            musician: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MusiciansService>(MusiciansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
