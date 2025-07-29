import { Test, TestingModule } from '@nestjs/testing';
import { MusiciansService } from './musicians.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MusiciansService', () => {
  let service: MusiciansService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    musician: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    goal: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusiciansService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MusiciansService>(MusiciansService);
    prismaService = module.get(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMusicianById', () => {
    it('should return musician data when found', async () => {
      const mockMusician = {
        id: 1,
        displayName: 'Test User',
        bio: 'Test bio',
        avatarUrl: 'test.jpg',
        totalSessions: 10,
        totalPracticeSeconds: 3600,
        totalGasUpsGiven: 5,
        totalGasUpsReceived: 3,
        createdAt: new Date(),
        instruments: [{ id: 1, label: 'Guitar', color: '#FF0000' }],
      };

      const mockGoals = [
        {
          id: 1,
          musicianId: 1,
          tag: 'Practice',
          type: 'daily',
          target: 30,
          timeFrame: 'minutes',
          createdAt: new Date(),
        },
      ];

      (prismaService.musician.findUnique as jest.Mock).mockResolvedValue(
        mockMusician,
      );
      (prismaService.goal.findMany as jest.Mock).mockResolvedValue(mockGoals);
      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getMusicianById(1, 2);

      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.displayName).toBe('Test User');
      expect(result?.goals).toHaveLength(1);
      expect(result?.isFollowing).toBe(false);
    });

    it('should return null when musician not found', async () => {
      (prismaService.musician.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getMusicianById(999);

      expect(result).toBeNull();
    });

    it('should handle viewing own profile', async () => {
      const mockMusician = {
        id: 1,
        displayName: 'Test User',
        bio: null,
        avatarUrl: null,
        totalSessions: 0,
        totalPracticeSeconds: 0,
        totalGasUpsGiven: 0,
        totalGasUpsReceived: 0,
        createdAt: new Date(),
        instruments: [],
      };

      (prismaService.musician.findUnique as jest.Mock).mockResolvedValue(
        mockMusician,
      );
      (prismaService.goal.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getMusicianById(1, 1);

      expect(result).toBeDefined();
      expect(result?.bio).toBe('');
      expect(result?.profilePictureUrl).toBe(null);
    });
  });

  describe('createMusician', () => {
    it('should create a new musician', async () => {
      const createMusicianDto = {
        googleId: 'google123',
        displayName: 'New User',
        givenName: 'New',
        familyName: 'User',
        email: 'newuser@test.com',
        profilePictureUrl: 'new.jpg',
      };

      const mockCreatedMusician = {
        id: 1,
        ...createMusicianDto,
        bio: null,
        totalSessions: 0,
        totalPracticeSeconds: 0,
        totalGasUpsGiven: 0,
        totalGasUpsReceived: 0,
        createdAt: new Date(),
        instruments: [],
      };

      (prismaService.musician.create as jest.Mock).mockResolvedValue(
        mockCreatedMusician,
      );

      const result = await service.createMusician(createMusicianDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.displayName).toBe('New User');
      expect(prismaService.musician.create).toHaveBeenCalledWith({
        data: {
          googleId: createMusicianDto.googleId,
          displayName: createMusicianDto.displayName,
          givenName: createMusicianDto.givenName,
          familyName: createMusicianDto.familyName,
          email: createMusicianDto.email,
          avatarUrl: createMusicianDto.profilePictureUrl,
          bio: 'A place for you to describe yourself as a musician :)',
          totalSessions: 0,
          totalPracticeSeconds: 0,
          totalGasUpsGiven: 0,
          totalGasUpsReceived: 0,
        },
        include: {
          instruments: true,
        },
      });
    });
  });

  describe('findOrCreateMusician', () => {
    it('should find existing musician', async () => {
      const loginInfo = {
        googleId: 'google123',
        displayName: 'Existing User',
        givenName: 'Existing',
        familyName: 'User',
        email: 'existing@test.com',
        profilePictureUrl: 'existing.jpg',
      };

      const mockMusician = {
        id: 1,
        ...loginInfo,
        bio: null,
        totalSessions: 0,
        totalPracticeSeconds: 0,
        totalGasUpsGiven: 0,
        totalGasUpsReceived: 0,
        createdAt: new Date(),
        instruments: [],
      };

      (prismaService.musician.findUnique as jest.Mock).mockResolvedValue(
        mockMusician,
      );

      const result = await service.findOrCreateMusician(loginInfo);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.displayName).toBe('Existing User');
    });

    it('should create new musician if not found', async () => {
      const loginInfo = {
        googleId: 'google123',
        displayName: 'New User',
        givenName: 'New',
        familyName: 'User',
        email: 'new@test.com',
        profilePictureUrl: 'new.jpg',
      };

      const mockCreatedMusician = {
        id: 1,
        ...loginInfo,
        bio: null,
        totalSessions: 0,
        totalPracticeSeconds: 0,
        totalGasUpsGiven: 0,
        totalGasUpsReceived: 0,
        createdAt: new Date(),
        instruments: [],
      };

      (prismaService.musician.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.musician.create as jest.Mock).mockResolvedValue(
        mockCreatedMusician,
      );

      const result = await service.findOrCreateMusician(loginInfo);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(prismaService.musician.create).toHaveBeenCalledWith({
        data: {
          googleId: loginInfo.googleId,
          displayName: loginInfo.displayName,
          givenName: loginInfo.givenName,
          familyName: loginInfo.familyName,
          email: loginInfo.email,
          avatarUrl: loginInfo.profilePictureUrl,
          bio: 'A place for you to describe yourself as a musician :)',
          totalSessions: 0,
          totalPracticeSeconds: 0,
          totalGasUpsGiven: 0,
          totalGasUpsReceived: 0,
        },
        include: {
          instruments: true,
        },
      });
    });
  });

  describe('updateMusician', () => {
    it('should update musician data', async () => {
      const updateDto = {
        id: 1,
        updatedDisplayName: 'Updated User',
        updatedBio: 'Updated bio',
        updatedInstruments: ['Guitar', 'Piano'],
      };

      const mockUpdatedMusician = {
        id: 1,
        displayName: 'Updated User',
        bio: 'Updated bio',
        avatarUrl: 'test.jpg',
        totalSessions: 10,
        totalPracticeSeconds: 3600,
        totalGasUpsGiven: 5,
        totalGasUpsReceived: 3,
        createdAt: new Date(),
        instruments: [],
      };

      (prismaService.musician.update as jest.Mock).mockResolvedValue(
        mockUpdatedMusician,
      );
      (prismaService.goal.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.updateMusician(updateDto);

      expect(result).toBeDefined();
      expect(result.displayName).toBe('Updated User');
      expect(result.bio).toBe('Updated bio');
    });
  });

  describe('updateProfile', () => {
    it('should update musician profile', async () => {
      const profileUpdateDto = {
        displayName: 'New Display Name',
        bio: 'New bio',
        instruments: [
          { id: 1, label: 'Guitar', color: '#FF0000', createdAt: new Date() },
        ],
      };

      const mockUpdatedMusician = {
        id: 1,
        displayName: 'New Display Name',
        bio: 'New bio',
        avatarUrl: 'new-avatar.jpg',
        totalSessions: 10,
        totalPracticeSeconds: 3600,
        totalGasUpsGiven: 5,
        totalGasUpsReceived: 3,
        createdAt: new Date(),
        instruments: [],
      };

      (prismaService.musician.update as jest.Mock).mockResolvedValue(
        mockUpdatedMusician,
      );
      (prismaService.goal.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.updateProfile(1, profileUpdateDto);

      expect(result).toBeDefined();
      expect(result.displayName).toBe('New Display Name');
      expect(result.bio).toBe('New bio');
    });
  });

  describe('getAllDisplayNames', () => {
    it('should return all musician display names', async () => {
      const mockMusicians = [
        { displayName: 'User 1' },
        { displayName: 'User 2' },
        { displayName: 'User 3' },
      ];

      (prismaService.musician.findMany as jest.Mock).mockResolvedValue(
        mockMusicians,
      );

      const result = await service.getAllDisplayNames();

      expect(result).toEqual(['User 1', 'User 2', 'User 3']);
      expect(prismaService.musician.findMany).toHaveBeenCalledWith({
        select: { displayName: true },
        orderBy: { displayName: 'asc' },
      });
    });
  });

  describe('getAllIdNames', () => {
    it('should return all musician IDs and names', async () => {
      const mockMusicians = [
        { id: 1, displayName: 'User 1', avatarUrl: null },
        {
          id: 2,
          displayName: 'User 2',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      ];

      (prismaService.musician.findMany as jest.Mock).mockResolvedValue(
        mockMusicians,
      );

      const result = await service.getAllIdNames();

      expect(result).toEqual([
        { id: 1, displayName: 'User 1', avatarUrl: null },
        {
          id: 2,
          displayName: 'User 2',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      ]);
      expect(prismaService.musician.findMany).toHaveBeenCalledWith({
        select: { id: true, displayName: true, avatarUrl: true },
        orderBy: { displayName: 'asc' },
      });
    });
  });

  describe('createGoalForMusician', () => {
    it('should create a goal for musician', async () => {
      const goalDto = {
        id: 0, // Will be set by database
        musicianId: 1,
        tag: 'Practice',
        type: 'duration' as const,
        target: 30,
        timeFrame: 'daily' as const,
        createdAt: new Date(),
      };

      const mockCreatedGoal = {
        id: 1,
        musicianId: 1,
        tag: 'Practice',
        type: 'duration' as const,
        target: 30,
        timeFrame: 'daily' as const,
        createdAt: new Date(),
      };

      (prismaService.goal.create as jest.Mock).mockResolvedValue(
        mockCreatedGoal,
      );

      const result = await service.createGoalForMusician(1, goalDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.musicianId).toBe(1);
      expect(result.tag).toBe('Practice');
    });
  });

  describe('deleteGoalForMusician', () => {
    it('should delete a goal for musician', async () => {
      (prismaService.goal.delete as jest.Mock).mockResolvedValue({});

      await service.deleteGoalForMusician(1, 1);

      expect(prismaService.goal.delete).toHaveBeenCalledWith({
        where: { id: 1, musicianId: 1 },
      });
    });
  });

  describe('updateGoalForMusician', () => {
    it('should update a goal for musician', async () => {
      const goalDto = {
        id: 1,
        musicianId: 1,
        tag: 'Updated Practice',
        type: 'frequency' as const,
        target: 60,
        timeFrame: 'weekly' as const,
        createdAt: new Date(),
      };

      const mockUpdatedGoal = {
        id: 1,
        musicianId: 1,
        tag: 'Updated Practice',
        type: 'frequency' as const,
        target: 60,
        timeFrame: 'weekly' as const,
        createdAt: new Date(),
      };

      (prismaService.goal.update as jest.Mock).mockResolvedValue(
        mockUpdatedGoal,
      );

      const result = await service.updateGoalForMusician(1, 1, goalDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.tag).toBe('Updated Practice');
    });
  });

  describe('followMusician', () => {
    it('should create a follow relationship', async () => {
      const mockFollower = { id: 1, displayName: 'Follower' };
      const mockFollowing = { id: 2, displayName: 'Following' };

      (prismaService.musician.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowing);
      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.follow.create as jest.Mock).mockResolvedValue({});

      await service.followMusician(1, 2);

      expect(prismaService.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: 1,
          followingId: 2,
        },
      });
    });
  });

  describe('unfollowMusician', () => {
    it('should delete a follow relationship', async () => {
      (prismaService.follow.deleteMany as jest.Mock).mockResolvedValue({});

      await service.unfollowMusician(1, 2);

      expect(prismaService.follow.deleteMany).toHaveBeenCalledWith({
        where: {
          followerId: 1,
          followingId: 2,
        },
      });
    });
  });

  describe('getFollowStatus', () => {
    it('should return follow status when following', async () => {
      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue({
        followerId: 1,
        followingId: 2,
      });

      const result = await service.getFollowStatus(1, 2);

      expect(result.isFollowing).toBe(true);
    });

    it('should return follow status when not following', async () => {
      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getFollowStatus(1, 2);

      expect(result.isFollowing).toBe(false);
    });
  });

  describe('getFollowCounts', () => {
    it('should return follower and following counts', async () => {
      (prismaService.follow.count as jest.Mock)
        .mockResolvedValueOnce(2) // First call for followers
        .mockResolvedValueOnce(1); // Second call for following

      const result = await service.getFollowCounts(1);

      expect(result.followerCount).toBe(2);
      expect(result.followingCount).toBe(1);
    });
  });

  describe('formatMusicianForJwt', () => {
    it('should format musician for JWT', () => {
      const mockMusician = {
        id: 1,
        displayName: 'Test User',
        email: 'test@test.com',
      };

      const result = service.formatMusicianForJwt(mockMusician);

      expect(result).toEqual({
        id: 1,
        displayName: 'Test User',
        email: 'test@test.com',
      });
    });
  });

  describe('formatMusicianForFrontend', () => {
    it('should format musician for frontend', () => {
      const mockMusician = {
        id: 1,
        displayName: 'Test User',
        bio: 'Test bio',
        avatarUrl: 'test.jpg',
        totalSessions: 10,
        totalPracticeSeconds: 3600,
        totalGasUpsGiven: 5,
        totalGasUpsReceived: 3,
        createdAt: new Date(),
        instruments: [],
      };

      const result = service.formatMusicianForFrontend(mockMusician);

      expect(result).toEqual({
        id: 1,
        displayName: 'Test User',
        bio: 'Test bio',
        profilePictureUrl: 'test.jpg',
        totalSessions: 10,
        totalPracticeSeconds: 3600,
        totalGasUpsGiven: 5,
        totalGasUpsReceived: 3,
        createdAt: mockMusician.createdAt,
        instruments: [],
        goals: [],
      });
    });
  });
});
