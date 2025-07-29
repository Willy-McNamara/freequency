import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    // Set up a mock database URL for testing
    process.env.DATABASE_URL_V3 =
      'postgresql://test:test@localhost:5432/test_db';

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    // Clean up the environment variable
    delete process.env.DATABASE_URL_V3;

    // Disconnect from the database to clean up
    if (service) {
      await service.$disconnect();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a working getPrisma method', () => {
    const prisma = service.getPrisma();
    expect(prisma).toBeDefined();
    expect(prisma).toBe(service);
  });
});
