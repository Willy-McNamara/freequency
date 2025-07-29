import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    taskDefinition: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    follow: {
      findMany: jest.fn(),
    },
    musician: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    savedTask: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    tag: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('should return all tasks without filters', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          instrument: 'Guitar',
          tags: [],
          musician: { id: 1, displayName: 'Test User', avatarUrl: null },
        },
      ];

      (prismaService.taskDefinition.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );
      (prismaService.savedTask.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAllTasks();

      expect(result).toBeDefined();
      expect(prismaService.taskDefinition.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should filter by following users', async () => {
      const mockFollowingIds = [{ followingId: 2 }, { followingId: 3 }];
      const mockTasks = [
        {
          id: 1,
          title: 'Following Task',
          description: 'Following Description',
          instrument: 'Piano',
          tags: [],
          musician: { id: 2, displayName: 'Following User', avatarUrl: null },
        },
      ];

      (prismaService.follow.findMany as jest.Mock).mockResolvedValue(
        mockFollowingIds,
      );
      (prismaService.taskDefinition.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );
      (prismaService.savedTask.findMany as jest.Mock).mockResolvedValue([]);

      const filters = { following: true, userId: 1 };
      const result = await service.getAllTasks(filters);

      expect(result).toBeDefined();
      expect(prismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followerId: 1 },
        select: { followingId: true },
      });
      expect(prismaService.taskDefinition.findMany).toHaveBeenCalledWith({
        where: { musicianId: { in: [2, 3] } },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should filter by specific users', async () => {
      const mockMusicians = [{ id: 2 }, { id: 3 }];
      const mockTasks = [
        {
          id: 1,
          title: 'User Task',
          description: 'User Description',
          instrument: 'Violin',
          tags: [],
          musician: { id: 2, displayName: 'User 1', avatarUrl: null },
        },
      ];

      (prismaService.musician.findMany as jest.Mock).mockResolvedValue(
        mockMusicians,
      );
      (prismaService.taskDefinition.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );
      (prismaService.savedTask.findMany as jest.Mock).mockResolvedValue([]);

      const filters = { users: ['User 1', 'User 2'] };
      const result = await service.getAllTasks(filters);

      expect(result).toBeDefined();
      expect(prismaService.musician.findMany).toHaveBeenCalledWith({
        where: { displayName: { in: ['User 1', 'User 2'] } },
        select: { id: true },
      });
      expect(prismaService.taskDefinition.findMany).toHaveBeenCalledWith({
        where: { musicianId: { in: [2, 3] } },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should filter by saved tasks', async () => {
      const mockSavedTasks = [{ taskDefinitionId: 1 }, { taskDefinitionId: 2 }];
      const mockTasks = [
        {
          id: 1,
          title: 'Saved Task',
          description: 'Saved Description',
          instrument: 'Drums',
          tags: [],
          musician: { id: 1, displayName: 'Test User', avatarUrl: null },
        },
      ];

      (prismaService.savedTask.findMany as jest.Mock)
        .mockResolvedValueOnce(mockSavedTasks) // First call for filtering
        .mockResolvedValueOnce([{ taskDefinitionId: 1 }]); // Second call for saved status

      (prismaService.taskDefinition.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );

      const filters = { saved: true, userId: 1 };
      const result = await service.getAllTasks(filters);

      expect(result).toBeDefined();
      expect(prismaService.savedTask.findMany).toHaveBeenCalledWith({
        where: { musicianId: 1 },
        select: { taskDefinitionId: true },
      });
      expect(prismaService.taskDefinition.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should return empty array when no saved tasks exist', async () => {
      (prismaService.savedTask.findMany as jest.Mock).mockResolvedValue([]);

      const filters = { saved: true, userId: 1 };
      const result = await service.getAllTasks(filters);

      expect(result).toEqual([]);
      expect(prismaService.taskDefinition.findMany).not.toHaveBeenCalled();
    });

    it('should filter by allowed IDs', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Allowed Task',
          description: 'Allowed Description',
          instrument: 'Bass',
          tags: [],
          musician: { id: 1, displayName: 'Test User', avatarUrl: null },
        },
      ];

      (prismaService.taskDefinition.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );
      (prismaService.savedTask.findMany as jest.Mock).mockResolvedValue([]);

      const filters = { allowedIds: [1, 2, 3] };
      const result = await service.getAllTasks(filters);

      expect(result).toBeDefined();
      expect(prismaService.taskDefinition.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2, 3] } },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should return empty array when allowed IDs is empty', async () => {
      const filters = { allowedIds: [] };
      const result = await service.getAllTasks(filters);

      expect(result).toEqual([]);
      expect(prismaService.taskDefinition.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return a task by ID', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        instrument: 'Guitar',
        tags: [],
        musician: { id: 1, displayName: 'Test User', avatarUrl: null },
      };

      (prismaService.taskDefinition.findUnique as jest.Mock).mockResolvedValue(
        mockTask,
      );
      (prismaService.savedTask.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getTaskById(1);

      expect(result).toBeDefined();
      expect(prismaService.taskDefinition.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should return null for non-existent task', async () => {
      (prismaService.taskDefinition.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      const result = await service.getTaskById(999);

      expect(result).toBeNull();
    });

    it('should return task with parent task information when parent exists', async () => {
      const mockTask = {
        id: 2,
        title: 'Child Task',
        description: 'Child Description',
        checklist: [],
        savedCount: 0,
        usedCount: 0,
        parentTaskId: 1,
        parentTask: {
          id: 1,
          title: 'Parent Task',
          description: 'Parent Description',
          checklist: [],
          savedCount: 5,
          usedCount: 10,
          musician: { id: 1, displayName: 'Parent User', avatarUrl: null },
          tags: [],
        },
        musician: { id: 2, displayName: 'Child User', avatarUrl: null },
        tags: [],
      };

      (prismaService.taskDefinition.findUnique as jest.Mock).mockResolvedValue(
        mockTask,
      );

      const result = await service.getTaskById(2);

      expect(result).toBeDefined();
      expect(result?.parentTask).toBeDefined();
      expect(result?.parentTask?.id).toBe(1);
      expect(result?.parentTask?.title).toBe('Parent Task');
    });

    it('should return task without parent task information when no parent exists', async () => {
      const mockTask = {
        id: 1,
        title: 'Root Task',
        description: 'Root Description',
        checklist: [],
        savedCount: 0,
        usedCount: 0,
        parentTaskId: null,
        parentTask: null,
        musician: { id: 1, displayName: 'Root User', avatarUrl: null },
        tags: [],
      };

      (prismaService.taskDefinition.findUnique as jest.Mock).mockResolvedValue(
        mockTask,
      );

      const result = await service.getTaskById(1);

      expect(result).toBeDefined();
      expect(result?.parentTask).toBeNull();
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'Task Description',
        instrument: 'Guitar',
        checklist: ['Step 1', 'Step 2'],
        tags: ['Practice', 'Technique'],
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const upsertedTags: any[] = [];

      // Mock the main prisma.musician.findUnique call that happens before the transaction
      (prismaService.musician.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        displayName: 'Test User',
        avatarUrl: null,
      });

      // Mock the main prisma.tag.upsert calls
      let tagId = 1;
      (prismaService.tag.upsert as jest.Mock).mockImplementation(
        ({ where }) => {
          const tag = {
            id: tagId++,
            label: where.label,
            color: where.label === 'Guitar' ? '#FF0000' : '#00FF00',
          };
          return tag;
        },
      );

      // Mock the main prisma.taskDefinition.create call
      (prismaService.taskDefinition.create as jest.Mock).mockResolvedValue({
        id: 1,
        title: createTaskDto.title,
        description: createTaskDto.description,
        checklist: createTaskDto.checklist,
        savedCount: 0,
        usedCount: 0,
        musicianId: 1,
        tags: [
          { id: 1, label: 'Guitar', color: '#FF0000' },
          { id: 2, label: 'Practice', color: '#00FF00' },
        ],
        musician: {
          id: 1,
          displayName: 'Test User',
          avatarUrl: null,
          instruments: [],
        },
      });

      const result = await service.createTask(createTaskDto, 1);

      expect(result).toBeDefined();
      expect(prismaService.musician.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.tag.upsert).toHaveBeenCalledTimes(3); // Once for instrument, twice for tags
      expect(prismaService.taskDefinition.create).toHaveBeenCalled();
      expect(prismaService.musician.update).toHaveBeenCalled();
    });
  });

  describe('saveTaskForUser', () => {
    it('should save a task for a user', async () => {
      const mockSavedTask = {
        id: 1,
        taskDefinitionId: 1,
        musicianId: 1,
      };

      (prismaService.savedTask.upsert as jest.Mock).mockResolvedValue(
        mockSavedTask,
      );

      await service.saveTaskForUser(1, 1);

      expect(prismaService.savedTask.upsert).toHaveBeenCalledWith({
        where: {
          musicianId_taskDefinitionId: {
            musicianId: 1,
            taskDefinitionId: 1,
          },
        },
        update: {},
        create: {
          musicianId: 1,
          taskDefinitionId: 1,
        },
      });
    });
  });

  describe('unsaveTaskForUser', () => {
    it('should unsave a task for a user', async () => {
      (prismaService.savedTask.deleteMany as jest.Mock).mockResolvedValue({});

      await service.unsaveTaskForUser(1, 1);

      expect(prismaService.savedTask.deleteMany).toHaveBeenCalledWith({
        where: {
          musicianId: 1,
          taskDefinitionId: 1,
        },
      });
    });
  });

  describe('getTasks', () => {
    it('should get tasks with saved filter', async () => {
      const mockSavedTasks = [{ taskDefinitionId: 1 }];
      const mockTasks = [
        {
          id: 1,
          title: 'Saved Task',
          description: 'Saved Description',
          instrument: 'Piano',
          tags: [],
          musician: { id: 1, displayName: 'Test User', avatarUrl: null },
        },
      ];

      (prismaService.savedTask.findMany as jest.Mock).mockResolvedValue(
        mockSavedTasks,
      );
      (prismaService.taskDefinition.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );

      const result = await service.getTasks({ saved: 'true', userId: 1 });

      expect(result).toBeDefined();
      expect(prismaService.savedTask.findMany).toHaveBeenCalledWith({
        where: { musicianId: 1 },
        select: { taskDefinitionId: true },
      });
      expect(prismaService.taskDefinition.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1] } },
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });

    it('should get all tasks when saved filter is not true', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'All Task',
          description: 'All Description',
          instrument: 'Violin',
          tags: [],
          musician: { id: 1, displayName: 'Test User', avatarUrl: null },
        },
      ];

      (prismaService.taskDefinition.findMany as jest.Mock).mockResolvedValue(
        mockTasks,
      );

      const result = await service.getTasks({ saved: 'false', userId: 1 });

      expect(result).toBeDefined();
      expect(prismaService.taskDefinition.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { id: 'desc' },
      });
    });
  });

  describe('updateTask', () => {
    it('should throw error as not implemented yet', async () => {
      const updateTaskDto = {
        title: 'Updated Task',
        description: 'Updated Description',
      };

      await expect(service.updateTask(1, updateTaskDto)).rejects.toThrow(
        'Not implemented yet',
      );
    });
  });

  describe('deleteTask', () => {
    it('should throw error as not implemented yet', async () => {
      await expect(service.deleteTask(1)).rejects.toThrow(
        'Not implemented yet',
      );
    });
  });
});
