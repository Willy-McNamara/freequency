import { Test, TestingModule } from '@nestjs/testing';
import { MusiciansController } from './musicians.controller';
import { MusiciansService } from './musicians.service';
import { PrismaService } from '../prisma/prisma.service';
import { CSRFGuard } from '../guards/csrf.guard';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('MusiciansController', () => {
  let controller: MusiciansController;
  let musiciansService: jest.Mocked<MusiciansService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockMusiciansService = {
    getAllDisplayNames: jest.fn(),
    getAllIdNames: jest.fn(),
    getMusicianById: jest.fn(),
    getGoalsForMusician: jest.fn(),
    createGoalForMusician: jest.fn(),
    updateGoalForMusician: jest.fn(),
    deleteGoalForMusician: jest.fn(),
    followMusician: jest.fn(),
    unfollowMusician: jest.fn(),
    updateProfile: jest.fn(),
  };

  const mockPrismaService = {
    musician: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusiciansController],
      providers: [
        { provide: MusiciansService, useValue: mockMusiciansService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(CSRFGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MusiciansController>(MusiciansController);
    musiciansService = module.get(MusiciansService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllDisplayNames', () => {
    it('should return all display names', async () => {
      const mockNames = ['User 1', 'User 2', 'User 3'];
      (musiciansService.getAllDisplayNames as jest.Mock).mockResolvedValue(
        mockNames,
      );

      const result = await controller.getAllDisplayNames();

      expect(result).toEqual(mockNames);
      expect(musiciansService.getAllDisplayNames).toHaveBeenCalled();
    });
  });

  describe('getAllIdNames', () => {
    it('should return all id names', async () => {
      const mockIdNames = [
        { id: 1, displayName: 'User 1', avatarUrl: null },
        { id: 2, displayName: 'User 2', avatarUrl: 'avatar2.jpg' },
      ];
      (musiciansService.getAllIdNames as jest.Mock).mockResolvedValue(
        mockIdNames,
      );

      const result = await controller.getAllIdNames();

      expect(result).toEqual(mockIdNames);
      expect(musiciansService.getAllIdNames).toHaveBeenCalled();
    });
  });

  describe('getMusicianById', () => {
    it('should return musician by id', async () => {
      const mockMusician = {
        id: 1,
        displayName: 'Test User',
        bio: 'Test bio',
        instruments: [],
        profilePictureUrl: null,
        totalSessions: 5,
        totalPracticeSeconds: 3600,
        totalGasUpsGiven: 10,
        totalGasUpsReceived: 5,
        createdAt: new Date(),
        goals: [],
      };
      const mockReq = { user: { id: 2 } };

      (musiciansService.getMusicianById as jest.Mock).mockResolvedValue(
        mockMusician,
      );

      const result = await controller.getMusicianById('1', mockReq as any);

      expect(result).toEqual(mockMusician);
      expect(musiciansService.getMusicianById).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('getGoalsForMusician', () => {
    it('should return goals for musician', async () => {
      const mockGoals = [
        {
          id: 1,
          tag: 'guitar',
          type: 'duration' as const,
          target: 30,
          timeFrame: 'daily' as const,
        },
        {
          id: 2,
          tag: 'piano',
          type: 'frequency' as const,
          target: 5,
          timeFrame: 'weekly' as const,
        },
      ];
      (musiciansService.getGoalsForMusician as jest.Mock).mockResolvedValue(
        mockGoals,
      );

      const result = await controller.getGoalsForMusician('1');

      expect(result).toEqual(mockGoals);
      expect(musiciansService.getGoalsForMusician).toHaveBeenCalledWith(1);
    });
  });

  describe('createGoalForMusician', () => {
    it('should create goal for musician', async () => {
      const mockGoal = {
        id: 1,
        tag: 'guitar',
        type: 'duration' as const,
        target: 30,
        timeFrame: 'daily' as const,
      };
      const goalDto = {
        tag: 'guitar',
        type: 'duration' as const,
        target: 30,
        timeFrame: 'daily' as const,
      };

      (musiciansService.createGoalForMusician as jest.Mock).mockResolvedValue(
        mockGoal,
      );

      const result = await controller.createGoalForMusician('1', goalDto);

      expect(result).toEqual(mockGoal);
      expect(musiciansService.createGoalForMusician).toHaveBeenCalledWith(
        1,
        goalDto,
      );
    });
  });

  describe('updateGoalForMusician', () => {
    it('should update goal for musician', async () => {
      const mockGoal = {
        id: 1,
        tag: 'guitar',
        type: 'duration' as const,
        target: 60,
        timeFrame: 'daily' as const,
      };
      const goalDto = {
        tag: 'guitar',
        type: 'duration' as const,
        target: 60,
        timeFrame: 'daily' as const,
      };
      const mockReq = { user: { id: 1 } };

      (musiciansService.updateGoalForMusician as jest.Mock).mockResolvedValue(
        mockGoal,
      );

      const result = await controller.updateGoalForMusician(
        '1',
        '1',
        goalDto,
        mockReq as any,
      );

      expect(result).toEqual(mockGoal);
      expect(musiciansService.updateGoalForMusician).toHaveBeenCalledWith(
        1,
        1,
        goalDto,
      );
    });

    it('should throw error when updating another user goal', async () => {
      const goalDto = {
        tag: 'guitar',
        type: 'duration' as const,
        target: 60,
        timeFrame: 'daily' as const,
      };
      const mockReq = { user: { id: 2 } };

      await expect(
        controller.updateGoalForMusician('1', '1', goalDto, mockReq as any),
      ).rejects.toThrow('Unauthorized: Can only update your own goals');
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal', async () => {
      (musiciansService.deleteGoalForMusician as jest.Mock).mockResolvedValue(
        undefined,
      );

      await controller.deleteGoal('1', '1');

      expect(musiciansService.deleteGoalForMusician).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('followMusician', () => {
    it('should follow musician', async () => {
      const mockReq = { user: { id: 1 } };

      (musiciansService.followMusician as jest.Mock).mockResolvedValue(
        undefined,
      );

      await controller.followMusician('2', mockReq as any);

      expect(musiciansService.followMusician).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('unfollowMusician', () => {
    it('should unfollow musician', async () => {
      const mockReq = { user: { id: 1 } };

      (musiciansService.unfollowMusician as jest.Mock).mockResolvedValue(
        undefined,
      );

      await controller.unfollowMusician('2', mockReq as any);

      expect(musiciansService.unfollowMusician).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      const mockProfile = {
        id: 1,
        displayName: 'Updated Name',
        bio: 'Updated bio',
        instruments: [],
      };
      const profileDto = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
        instruments: ['guitar'],
      };
      const mockReq = { user: { id: 1 } };

      (musiciansService.updateProfile as jest.Mock).mockResolvedValue(
        mockProfile,
      );

      const result = await controller.updateProfile(
        '1',
        profileDto,
        mockReq as any,
      );

      expect(result).toEqual(mockProfile);
      expect(musiciansService.updateProfile).toHaveBeenCalledWith(
        1,
        profileDto,
      );
    });

    it('should throw error when updating another user profile', async () => {
      const profileDto = {
        displayName: 'Updated Name',
        bio: 'Updated bio',
        instruments: ['guitar'],
      };
      const mockReq = { user: { id: 2 } };

      await expect(
        controller.updateProfile('1', profileDto, mockReq as any),
      ).rejects.toThrow('Unauthorized: Can only update your own profile');
    });
  });
});
