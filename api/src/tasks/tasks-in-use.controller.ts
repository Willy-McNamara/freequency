import { Controller, Get, Param, Query } from '@nestjs/common';
import { TasksInUseService } from './tasks-in-use.service';
import { TaskInUseDto } from './dto/task-in-use.dto';

@Controller('tasks-in-use')
export class TasksInUseController {
  constructor(private readonly tasksInUseService: TasksInUseService) {}

  @Get('musician/:musicianId')
  async getTasksInUseForMusician(
    @Param('musicianId') musicianId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('tag') tag?: string,
  ): Promise<TaskInUseDto[]> {
    return this.tasksInUseService.getTasksInUseForMusician(
      Number(musicianId),
      start,
      end,
      tag,
    );
  }
}
