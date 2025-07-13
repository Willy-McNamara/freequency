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

  async getAllTasks(filters?: TaskFilters): Promise<TaskDTO[]> {
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

    // Filter by saved tasks (savedCount > 0)
    if (filters?.saved) {
      where.savedCount = {
        gt: 0,
      };
    }

    console.log('Final where clause:', where);

    const tasks = await this.prisma.taskDefinition.findMany({
      where,
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
      orderBy: {
        id: 'desc',
      },
    });

    console.log('Found tasks:', tasks.length);

    // Map the database tasks to TaskDTO objects
    let taskDtos: TaskDTO[] = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      instrument: task.musician.instruments[0]?.label || 'Unknown', // Use first instrument as primary
      user: {
        displayName: task.musician.displayName,
        avatarUrl: task.musician.avatarUrl,
      },
      tags: task.musician.instruments.map((instrument) => ({
        id: instrument.id,
        label: instrument.label,
        color: instrument.color,
      })),
      checklist: task.checklist,
      savedCount: task.savedCount,
      usedCount: task.usedCount,
    }));

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
      tags: task.musician.instruments.map((instrument) => ({
        id: instrument.id,
        label: instrument.label,
        color: instrument.color,
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
