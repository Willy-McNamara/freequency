import { Test, TestingModule } from '@nestjs/testing';
import { MusiciansController } from './musicians.controller';
import { MusiciansService } from './musicians.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MusiciansController', () => {
  let controller: MusiciansController;

  beforeEach(async () => {
    const mockPrismaService = {};
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusiciansController],
      providers: [
        MusiciansService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<MusiciansController>(MusiciansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
