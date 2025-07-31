import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSessionDto,
  NewCommentDto,
  NewGasUpDto,
} from './dto/session.dto';

describe('SessionsService', () => {
  let service: SessionsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    session: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    gasUp: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    comment: {
      create: jest.fn(),
    },
    musician: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    follow: {
      findMany: jest.fn(),
    },
    tag: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    taskInUse: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    prismaService = module.get(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSessionsWithFilters', () => {
    it('should return sessions with basic filters', async () => {
      const mockSessions = [
        {
          id: 1,
          title: 'Test Session',
          notes: 'Test Notes',
          duration: 30,
          isPublic: true,
          createdAt: new Date(),
          musicianId: 1,
          gasUps: [],
          comments: [],
          instruments: [{ id: 1, label: 'Guitar', color: null }],
          tags: [{ id: 1, label: 'Practice', color: null }],
          media: [],
          tasksInUse: [],
          musician: { id: 1, displayName: 'Test User', avatarUrl: null },
        },
      ];

      (prismaService.session.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );

      const filters = {
        userIds: [1],
        instruments: ['Guitar'],
        tags: ['Practice'],
        saved: false,
      };

      const result = await service.getSessionsWithFilters(filters);

      expect(result.sessions).toBeDefined();
      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        take: 11, // take + 1
        cursor: undefined,
        orderBy: { id: 'desc' },
        where: {
          musicianId: { in: [1] },
          instruments: {
            some: {
              label: { in: ['Guitar'] },
            },
          },
          tags: {
            some: {
              label: { in: ['Practice'] },
            },
          },
        },
        include: expect.any(Object),
      });
    });

    it('should handle empty filters', async () => {
      const mockSessions = [];
      (prismaService.session.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );

      const filters = {
        userIds: [],
        instruments: [],
        tags: [],
        saved: false,
      };

      const result = await service.getSessionsWithFilters(filters);

      expect(result.sessions).toEqual(mockSessions);
      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        take: 11,
        cursor: undefined,
        orderBy: { id: 'desc' },
        where: {},
        include: expect.any(Object),
      });
    });

    it('should handle cursor pagination', async () => {
      const mockSessions = [];
      (prismaService.session.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );

      const filters = {
        userIds: [],
        instruments: [],
        tags: [],
        saved: false,
      };

      await service.getSessionsWithFilters(filters, '123');

      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        take: 11,
        cursor: { id: 123 },
        orderBy: { id: 'desc' },
        where: {},
        include: expect.any(Object),
      });
    });
  });

  describe('getFiveSessions', () => {
    it('should return five sessions', async () => {
      const mockSessions = [
        {
          id: 1,
          title: 'Session 1',
          notes: 'Notes 1',
          duration: 30,
          isPublic: true,
          createdAt: new Date(),
          musicianId: 1,
          instruments: [],
          tags: [],
          gasUps: [],
          comments: [],
          media: [],
          tasksInUse: [],
          musician: { id: 1, displayName: 'User 1', avatarUrl: null },
        },
        {
          id: 2,
          title: 'Session 2',
          notes: 'Notes 2',
          duration: 45,
          isPublic: true,
          createdAt: new Date(),
          musicianId: 2,
          instruments: [],
          tags: [],
          gasUps: [],
          comments: [],
          media: [],
          tasksInUse: [],
          musician: { id: 2, displayName: 'User 2', avatarUrl: null },
        },
      ];

      (prismaService.session.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );

      const result = await service.getFiveSessions();

      expect(result).toBeDefined();
      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { id: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('getSessionsFromFollowedUsers', () => {
    it('should return sessions from followed users', async () => {
      const mockFollowedUsers = [{ followingId: 2 }, { followingId: 3 }];
      const mockSessions = [
        {
          id: 1,
          title: 'Followed Session',
          notes: 'Followed Notes',
          duration: 30,
          isPublic: true,
          createdAt: new Date(),
          musicianId: 2,
          instruments: [],
          tags: [],
          gasUps: [],
          comments: [],
          media: [],
          tasksInUse: [],
          musician: { id: 2, displayName: 'Followed User', avatarUrl: null },
        },
      ];

      (prismaService.follow.findMany as jest.Mock).mockResolvedValue(
        mockFollowedUsers,
      );
      (prismaService.session.findMany as jest.Mock).mockResolvedValue(
        mockSessions,
      );

      const result = await service.getSessionsFromFollowedUsers(1);

      expect(result.sessions).toBeDefined();
      expect(prismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: 1 },
        select: { followingId: true },
      });
      expect(prismaService.session.findMany).toHaveBeenCalledWith({
        take: 11,
        cursor: undefined,
        orderBy: { id: 'desc' },
        where: {
          musicianId: { in: [2, 3] },
          isPublic: true,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('getFollowedUserDisplayNames', () => {
    it('should return display names of followed users', async () => {
      const mockFollowedUsers = [
        { following: { displayName: 'User 1' } },
        { following: { displayName: 'User 2' } },
      ];

      (prismaService.follow.findMany as jest.Mock).mockResolvedValue(
        mockFollowedUsers,
      );

      const result = await service.getFollowedUserDisplayNames(1);

      expect(result).toEqual(['User 1', 'User 2']);
      expect(prismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: 1 },
        select: {
          following: {
            select: { displayName: true },
          },
        },
      });
    });
  });

  describe('getFollowedUserIds', () => {
    it('should return IDs of followed users', async () => {
      const mockFollowedUsers = [{ followingId: 2 }, { followingId: 3 }];

      (prismaService.follow.findMany as jest.Mock).mockResolvedValue(
        mockFollowedUsers,
      );

      const result = await service.getFollowedUserIds(1);

      expect(result).toEqual([2, 3]);
      expect(prismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: 1 },
        select: { followingId: true },
      });
    });
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const createSessionDto: CreateSessionDto = {
        title: 'New Session',
        notes: 'Session Notes',
        musicianId: 1,
        instruments: ['Guitar'],
        tags: ['Practice'],
        duration: 30,
        isPublic: true,
        tasks: [],
      };

      const mockCreatedSession = {
        id: 1,
        title: createSessionDto.title,
        notes: createSessionDto.notes,
        duration: createSessionDto.duration,
        isPublic: createSessionDto.isPublic,
        createdAt: new Date(),
        musicianId: createSessionDto.musicianId,
        instruments: [],
        tags: [],
        gasUps: [],
        comments: [],
        media: [],
        tasksInUse: [],
        musician: { id: 1, displayName: 'Test User', avatarUrl: null },
      };

      // Mock the transaction to return the created session
      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          // Create a mock prisma instance for the transaction
          const mockTransactionPrisma = {
            ...mockPrismaService,
            session: {
              ...mockPrismaService.session,
              create: jest.fn().mockResolvedValue(mockCreatedSession),
              findUnique: jest.fn().mockResolvedValue(mockCreatedSession),
            },
            tag: {
              findUnique: jest
                .fn()
                .mockResolvedValue({ id: 1, label: 'Guitar' }),
              create: jest.fn().mockResolvedValue({ id: 1, label: 'Guitar' }),
            },
            taskInUse: {
              create: jest.fn().mockResolvedValue({ id: 1 }),
            },
          };
          return callback(mockTransactionPrisma);
        },
      );

      const result = await service.createSession(createSessionDto);

      expect(result).toBeDefined();
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('addComment', () => {
    it('should add a comment to a session', async () => {
      const newCommentDto: NewCommentDto = {
        sessionId: 1,
        musicianId: 1,
        text: 'Great session!',
      };

      const mockCreatedComment = {
        id: 1,
        text: newCommentDto.text,
        musicianId: newCommentDto.musicianId,
        sessionId: newCommentDto.sessionId,
        createdAt: new Date(),
        musician: { id: 1, displayName: 'Test User', avatarUrl: null },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return callback(mockPrismaService);
        },
      );
      (prismaService.comment.create as jest.Mock).mockResolvedValue(
        mockCreatedComment,
      );

      const result = await service.addComment(newCommentDto);

      expect(result).toBeDefined();
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('addGasUp', () => {
    it('should add a gas up to a session', async () => {
      const newGasUpDto: NewGasUpDto = {
        sessionId: 1,
        musicianId: 1,
        gasserId: 2,
      };

      const mockCreatedGasUp = {
        id: 1,
        sessionId: newGasUpDto.sessionId,
        musicianId: newGasUpDto.musicianId,
        gasserId: newGasUpDto.gasserId,
        musician: { id: 1, displayName: 'Test User', avatarUrl: null },
      };

      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return callback(mockPrismaService);
        },
      );
      (prismaService.gasUp.create as jest.Mock).mockResolvedValue(
        mockCreatedGasUp,
      );
      (prismaService.musician.update as jest.Mock).mockResolvedValue({});

      const result = await service.addGasUp(newGasUpDto);

      expect(result).toBeDefined();
      expect(prismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('removeGasUp', () => {
    it('should remove a gas up from a session', async () => {
      const removeGasUpData = {
        gasserId: 2,
        sessionId: 1,
      };

      const mockExistingGasUp = {
        id: 1,
        sessionId: 1,
        musicianId: 2,
      };

      const mockSession = {
        id: 1,
        musicianId: 1,
      };

      // Mock finding existing gas up
      (prismaService.gasUp.findFirst as jest.Mock).mockResolvedValue(
        mockExistingGasUp,
      );

      // Mock finding session
      (prismaService.session.findUnique as jest.Mock).mockResolvedValue(
        mockSession,
      );

      // Mock transaction
      (prismaService.$transaction as jest.Mock).mockImplementation(
        async (callback) => {
          return callback(mockPrismaService);
        },
      );

      // Mock gas up deletion
      (prismaService.gasUp.delete as jest.Mock).mockResolvedValue({});

      // Mock musician updates
      (prismaService.musician.update as jest.Mock).mockResolvedValue({});

      const result = await service.removeGasUp(removeGasUpData);

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(prismaService.gasUp.delete).toHaveBeenCalledWith({
        where: { id: mockExistingGasUp.id },
      });
    });

    it('should return success when gas up does not exist', async () => {
      const removeGasUpData = {
        gasserId: 2,
        sessionId: 1,
      };

      // Mock finding no existing gas up
      (prismaService.gasUp.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.removeGasUp(removeGasUpData);

      expect(result).toEqual({ success: true });
      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should throw error when session not found', async () => {
      const removeGasUpData = {
        gasserId: 2,
        sessionId: 1,
      };

      const mockExistingGasUp = {
        id: 1,
        sessionId: 1,
        musicianId: 2,
      };

      // Mock finding existing gas up
      (prismaService.gasUp.findFirst as jest.Mock).mockResolvedValue(
        mockExistingGasUp,
      );

      // Mock finding no session
      (prismaService.session.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.removeGasUp(removeGasUpData)).rejects.toThrow(
        'Session not found',
      );
    });
  });
});
