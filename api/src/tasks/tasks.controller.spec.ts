import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: jest.Mocked<TasksService>;

  const mockTasksService = {
    getAllTasks: jest.fn(),
    getTaskById: jest.fn(),
    createTask: jest.fn(),
    saveTaskForUser: jest.fn(),
    unsaveTaskForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: mockTasksService }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTasks', () => {
    it('should return all tasks with filters', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          difficulty: 'beginner',
          estimatedMinutes: 30,
          tags: [],
          checklist: [],
        },
        {
          id: 2,
          title: 'Task 2',
          description: 'Description 2',
          difficulty: 'intermediate',
          estimatedMinutes: 45,
          tags: [],
          checklist: [],
        },
      ];

      const mockReq = { user: { id: 1 } };

      (tasksService.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);

      const result = await controller.getAllTasks(
        'true',
        '1,2',
        'guitar,piano',
        'true',
        mockReq,
      );

      expect(result).toEqual(mockTasks);
      expect(tasksService.getAllTasks).toHaveBeenCalledWith({
        following: true,
        users: ['1', '2'],
        instruments: ['guitar', 'piano'],
        saved: true,
        userId: 1,
      });
    });

    it('should return all tasks without filters', async () => {
      const mockTasks = [
        {
          id: 1,
          title: 'Task 1',
          description: 'Description 1',
          difficulty: 'beginner',
          estimatedMinutes: 30,
          tags: [],
          checklist: [],
        },
      ];

      (tasksService.getAllTasks as jest.Mock).mockResolvedValue(mockTasks);

      const result = await controller.getAllTasks();

      expect(result).toEqual(mockTasks);
      expect(tasksService.getAllTasks).toHaveBeenCalledWith({
        following: false,
        users: undefined,
        instruments: undefined,
        saved: false,
        userId: undefined,
      });
    });
  });

  describe('getTaskById', () => {
    it('should return task by id', async () => {
      const mockTask = {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        difficulty: 'beginner',
        estimatedMinutes: 30,
        tags: [],
        checklist: [],
      };

      (tasksService.getTaskById as jest.Mock).mockResolvedValue(mockTask);

      const result = await controller.getTaskById(1);

      expect(result).toEqual(mockTask);
      expect(tasksService.getTaskById).toHaveBeenCalledWith(1);
    });
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'New Task',
        description: 'New Description',
        instrument: 'Guitar',
        tags: ['Practice'],
        checklist: [],
      };

      const mockCreatedTask = {
        id: 1,
        ...createTaskDto,
      };

      const mockReq = { user: { id: 1 } };

      (tasksService.createTask as jest.Mock).mockResolvedValue(mockCreatedTask);

      const result = await controller.createTask(createTaskDto, mockReq);

      expect(result).toEqual(mockCreatedTask);
      expect(tasksService.createTask).toHaveBeenCalledWith(createTaskDto, 1);
    });
  });

  describe('saveTask', () => {
    it('should save task for user', async () => {
      const mockReq = { user: { id: 1 } };
      const taskId = 1;

      (tasksService.saveTaskForUser as jest.Mock).mockResolvedValue(undefined);

      await controller.saveTask(taskId, mockReq);

      expect(tasksService.saveTaskForUser).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('unsaveTask', () => {
    it('should unsave task for user', async () => {
      const mockReq = { user: { id: 1 } };
      const taskId = 1;

      (tasksService.unsaveTaskForUser as jest.Mock).mockResolvedValue(
        undefined,
      );

      await controller.unsaveTask(taskId, mockReq);

      expect(tasksService.unsaveTaskForUser).toHaveBeenCalledWith(1, 1);
    });
  });
});
