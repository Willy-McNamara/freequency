import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskInUseDto } from './dto/task-in-use.dto';

@Injectable()
export class TasksInUseService {
  constructor(private prisma: PrismaService) {}

  async getTasksInUseForMusician(
    musicianId: number,
    start?: string,
    end?: string,
    tag?: string,
  ): Promise<TaskInUseDto[]> {
    const where: any = { musicianId };
    if (start || end) {
      where.createdAt = {};
      if (start) where.createdAt.gte = new Date(start);
      if (end) where.createdAt.lte = new Date(end);
    }
    if (tag) {
      where.tags = { some: { label: tag } };
    }
    const tasks = await this.prisma.taskInUse.findMany({
      where,
      include: { tags: true },
      orderBy: { createdAt: 'asc' },
    });
    return tasks.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      duration: t.duration,
      notes: t.notes,
      isSessionTask: t.isSessionTask,
      checklistCompletions: t.checklistCompletions,
      taskDefinitionId: t.taskDefinitionId,
      musicianId: t.musicianId,
      sessionId: t.sessionId,
      tags: t.tags.map((tag) => tag.label),
    }));
  }
}
