import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskDTO, CreateTaskDto } from './dto/task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getAllTasks(): Promise<TaskDTO[]> {
    return this.tasksService.getAllTasks();
  }

  @Get(':id')
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskDTO | null> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<TaskDTO> {
    return this.tasksService.createTask(createTaskDto);
  }
}
