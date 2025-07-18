import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskDTO, CreateTaskDto } from './dto/task.dto';

interface TaskFilters {
  following?: boolean;
  users?: string[];
  instruments?: string[];
  saved?: boolean;
  userId?: number;
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(
    filters?: TaskFilters & { allowedIds?: number[] },
  ): Promise<TaskDTO[]> {
    console.log('TasksService.getAllTasks called with filters:', filters);

    // Build where clause for filtering
    const where: any = {};

    // Filter by following users
    if (filters?.following && filters?.userId) {
      console.log('Following filter enabled for userId:', filters.userId);
      const followingIds = await this.prisma.follow.findMany({
        where: { followerId: filters.userId },
        select: { followingId: true },
      });
      console.log('Found following IDs:', followingIds);
      where.musicianId = {
        in: followingIds.map((f) => f.followingId),
      };
      console.log('Where clause for following filter:', where);
    }

    // Filter by specific users
    if (filters?.users && filters.users.length > 0) {
      const musicians = await this.prisma.musician.findMany({
        where: { displayName: { in: filters.users } },
        select: { id: true },
      });
      where.musicianId = {
        in: musicians.map((m) => m.id),
      };
    }

    // User-specific saved filter
    if (filters?.saved && filters.userId) {
      // Get the user's saved task IDs
      const savedTasks = await this.prisma.savedTask.findMany({
        where: { musicianId: filters.userId },
        select: { taskDefinitionId: true },
      });
      const savedTaskIds = savedTasks.map((st) => st.taskDefinitionId);
      if (savedTaskIds.length === 0) {
        // Return early if no saved tasks
        return [];
      }
      where.id = { in: savedTaskIds };
    }

    // If allowedIds is provided, only return those tasks
    if (filters?.allowedIds) {
      if (filters.allowedIds.length === 0) {
        console.log('allowedIds is empty, returning []');
        return [];
      }
      where.id = { in: filters.allowedIds };
      console.log('allowedIds:', filters.allowedIds);
    }

    console.log('Final where clause:', where);

    const tasks = await this.prisma.taskDefinition.findMany({
      where,
      include: {
        tags: true,
        musician: {
          select: {
            displayName: true,
            avatarUrl: true,
            instruments: {
              select: {
                id: true,
                label: true,
                color: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    console.log('Found tasks:', tasks.length);

    // Fetch saved task IDs for the user, if userId is provided
    let savedTaskIds: number[] = [];
    if (filters?.userId) {
      const savedTasks = await this.prisma.savedTask.findMany({
        where: { musicianId: filters.userId },
        select: { taskDefinitionId: true },
      });
      savedTaskIds = savedTasks.map((st) => st.taskDefinitionId);
      console.log('User', filters.userId, 'has saved task IDs:', savedTaskIds);
    }

    // Map the database tasks to TaskDTO objects
    let taskDtos: TaskDTO[] = tasks.map((task) => {
      const isSaved = filters?.allowedIds
        ? true
        : savedTaskIds.includes(task.id);
      if (filters?.allowedIds) {
        console.log(`Task ${task.id} isSaved:`, isSaved);
      }
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        instrument: task.musician.instruments[0]?.label || 'Unknown',
        user: {
          displayName: task.musician.displayName,
          avatarUrl: task.musician.avatarUrl,
        },
        tags: task.tags.map((tag) => ({
          id: tag.id,
          label: tag.label,
          color: tag.color,
        })),
        checklist: task.checklist,
        savedCount: task.savedCount,
        usedCount: task.usedCount,
        isSaved,
      };
    });

    // Filter by instruments (client-side filtering for now)
    if (filters?.instruments && filters.instruments.length > 0) {
      taskDtos = taskDtos.filter((task) =>
        filters.instruments!.includes(task.instrument),
      );
    }

    return taskDtos;
  }

  async getTaskById(id: number): Promise<TaskDTO | null> {
    const task = await this.prisma.taskDefinition.findUnique({
      where: { id },
      include: {
        tags: true,
        musician: {
          select: {
            displayName: true,
            avatarUrl: true,
            instruments: {
              select: {
                id: true,
                label: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      instrument: task.musician.instruments[0]?.label || 'Unknown',
      user: {
        displayName: task.musician.displayName,
        avatarUrl: task.musician.avatarUrl,
      },
      tags: task.tags.map((tag) => ({
        id: tag.id,
        label: tag.label,
        color: tag.color,
      })),
      checklist: task.checklist,
      savedCount: task.savedCount,
      usedCount: task.usedCount,
    };
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    musicianId: number,
  ): Promise<TaskDTO> {
    // Use the authenticated user's ID instead of finding the first musician
    const musician = await this.prisma.musician.findUnique({
      where: { id: musicianId },
    });
    if (!musician) {
      throw new Error('Musician not found');
    }

    // Find or create tags for the instrument and other tags
    const tagsToConnect = [];

    // Add instrument tag
    const instrumentTag = await this.prisma.tag.upsert({
      where: { label: createTaskDto.instrument },
      update: {},
      create: {
        label: createTaskDto.instrument,
        color: this.getInstrumentColor(createTaskDto.instrument),
      },
    });
    tagsToConnect.push(instrumentTag);

    // Add other tags
    for (const tagLabel of createTaskDto.tags) {
      if (tagLabel !== createTaskDto.instrument) {
        // Don't duplicate instrument tag
        const tag = await this.prisma.tag.upsert({
          where: { label: tagLabel },
          update: {},
          create: {
            label: tagLabel,
            color: this.getRandomColor(),
          },
        });
        tagsToConnect.push(tag);
      }
    }

    // Create the task definition
    const newTask = await this.prisma.taskDefinition.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        checklist: createTaskDto.checklist,
        savedCount: 0,
        usedCount: 0,
        musicianId: musicianId,
      },
      include: {
        musician: {
          select: {
            displayName: true,
            avatarUrl: true,
            instruments: {
              select: {
                id: true,
                label: true,
                color: true,
              },
            },
          },
        },
      },
    });

    // Connect the tags to the musician's instruments
    await this.prisma.musician.update({
      where: { id: musicianId },
      data: {
        instruments: {
          connect: tagsToConnect.map((tag) => ({ id: tag.id })),
        },
      },
    });

    // Return the created task in the same format as other methods
    return {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      instrument: createTaskDto.instrument,
      user: {
        displayName: newTask.musician.displayName,
        avatarUrl: newTask.musician.avatarUrl,
      },
      tags: tagsToConnect.map((tag) => ({
        id: tag.id,
        label: tag.label,
        color: tag.color,
      })),
      checklist: newTask.checklist,
      savedCount: newTask.savedCount,
      usedCount: newTask.usedCount,
    };
  }

  async updateTask(id: number, updateTaskDto: any): Promise<TaskDTO> {
    // This would be implemented when we add task update functionality
    throw new Error('Not implemented yet');
  }

  async deleteTask(id: number): Promise<void> {
    // This would be implemented when we add task deletion functionality
    throw new Error('Not implemented yet');
  }

  async saveTaskForUser(taskId: number, userId: number) {
    // Create a SavedTask entry if it doesn't exist
    const savedTask = await this.prisma.savedTask.upsert({
      where: {
        musicianId_taskDefinitionId: {
          musicianId: userId,
          taskDefinitionId: taskId,
        },
      },
      update: {},
      create: {
        musicianId: userId,
        taskDefinitionId: taskId,
      },
    });

    // Increment savedCount
    await this.prisma.taskDefinition.update({
      where: { id: taskId },
      data: { savedCount: { increment: 1 } },
    });

    return savedTask;
  }

  async unsaveTaskForUser(taskId: number, userId: number) {
    // Remove the SavedTask entry
    const deleted = await this.prisma.savedTask.deleteMany({
      where: {
        musicianId: userId,
        taskDefinitionId: taskId,
      },
    });

    // Decrement savedCount only if a row was actually deleted
    if (deleted.count > 0) {
      await this.prisma.taskDefinition.update({
        where: { id: taskId },
        data: { savedCount: { decrement: 1 } },
      });
    }

    return deleted;
  }

  async getTasks({ saved, userId }: { saved?: string; userId?: number }) {
    console.log('getTasks called with saved:', saved, 'userId:', userId);
    if (saved === 'true' && userId) {
      // Return only tasks saved by the user
      const savedTasks = await this.prisma.savedTask.findMany({
        where: { musicianId: userId },
        select: { taskDefinitionId: true },
      });
      const savedTaskIds = savedTasks.map((st) => st.taskDefinitionId);
      console.log('Saved task IDs for user', userId, ':', savedTaskIds);
      return this.getAllTasks({
        userId,
        allowedIds: savedTaskIds,
      });
    }
    // Fallback to existing logic
    return this.getAllTasks({ userId });
  }

  private getInstrumentColor(instrument: string): string {
    const colors: { [key: string]: string } = {
      Piano: '#FFD700',
      Guitar: '#ADFF2F',
      Drums: '#FF4500',
      Bass: '#4169E1',
      Violin: '#8A2BE2',
      Saxophone: '#FF6347',
    };
    return colors[instrument] || '#808080';
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FF8A80',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
