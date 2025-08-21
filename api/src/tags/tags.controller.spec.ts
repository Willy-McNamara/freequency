import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CSRFGuard } from '../guards/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('TagsController', () => {
  let controller: TagsController;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    tag: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [{ provide: PrismaService, useValue: mockPrismaService }],
    })
      .overrideGuard(CSRFGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TagsController>(TagsController);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllLabels', () => {
    it('should return all tag labels', async () => {
      const mockTags = [
        { label: 'Practice' },
        { label: 'Performance' },
        { label: 'Theory' },
      ];

      (prismaService.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

      const result = await controller.getAllLabels();

      expect(result).toEqual(['Practice', 'Performance', 'Theory']);
      expect(prismaService.tag.findMany).toHaveBeenCalledWith({
        select: { label: true },
        orderBy: { label: 'asc' },
      });
    });
  });

  describe('createTag', () => {
    it('should create a new tag', async () => {
      const createTagDto = {
        label: 'New Tag',
        color: '#FF00FF',
      };

      const mockCreatedTag = {
        id: 1,
        label: 'new tag',
        color: '#FF00FF',
      };

      (prismaService.tag.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.tag.create as jest.Mock).mockResolvedValue(mockCreatedTag);

      const result = await controller.createTag(createTagDto);

      expect(result).toEqual(mockCreatedTag);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { label: 'new tag' },
      });
      expect(prismaService.tag.create).toHaveBeenCalledWith({
        data: { label: 'new tag', color: '#FF00FF' },
      });
    });

    it('should return existing tag if it already exists', async () => {
      const createTagDto = {
        label: 'Existing Tag',
        color: '#FF00FF',
      };

      const mockExistingTag = {
        id: 1,
        label: 'existing tag',
        color: '#FF0000',
      };

      (prismaService.tag.findUnique as jest.Mock).mockResolvedValue(
        mockExistingTag,
      );

      const result = await controller.createTag(createTagDto);

      expect(result).toEqual(mockExistingTag);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { label: 'existing tag' },
      });
      expect(prismaService.tag.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when label is empty', async () => {
      const createTagDto = {
        label: '',
        color: '#FF00FF',
      };

      await expect(controller.createTag(createTagDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.tag.findUnique).not.toHaveBeenCalled();
      expect(prismaService.tag.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when label is only whitespace', async () => {
      const createTagDto = {
        label: '   ',
        color: '#FF00FF',
      };

      await expect(controller.createTag(createTagDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.tag.findUnique).not.toHaveBeenCalled();
      expect(prismaService.tag.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when label becomes empty after sanitization', async () => {
      const createTagDto = {
        label: '@#$%^&*',
        color: '#FF00FF',
      };

      await expect(controller.createTag(createTagDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.tag.findUnique).not.toHaveBeenCalled();
      expect(prismaService.tag.create).not.toHaveBeenCalled();
    });

    it('should sanitize label correctly', async () => {
      const createTagDto = {
        label: '  Mixed Case Tag!  ',
        color: '#FF00FF',
      };

      const mockCreatedTag = {
        id: 1,
        label: 'mixed case tag!',
        color: '#FF00FF',
      };

      (prismaService.tag.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.tag.create as jest.Mock).mockResolvedValue(mockCreatedTag);

      const result = await controller.createTag(createTagDto);

      expect(result).toEqual(mockCreatedTag);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { label: 'mixed case tag!' },
      });
      expect(prismaService.tag.create).toHaveBeenCalledWith({
        data: { label: 'mixed case tag!', color: '#FF00FF' },
      });
    });

    it('should truncate label if too long', async () => {
      const longLabel = 'a'.repeat(35); // Longer than MAX_LENGTH (30)
      const createTagDto = {
        label: longLabel,
        color: '#FF00FF',
      };

      const mockCreatedTag = {
        id: 1,
        label: 'a'.repeat(30),
        color: '#FF00FF',
      };

      (prismaService.tag.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.tag.create as jest.Mock).mockResolvedValue(mockCreatedTag);

      const result = await controller.createTag(createTagDto);

      expect(result).toEqual(mockCreatedTag);
      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { label: 'a'.repeat(30) },
      });
    });
  });
});
