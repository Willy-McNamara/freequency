import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskDTO, CreateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllTasks(
    @Query('following') following?: string,
    @Query('users') users?: string,
    @Query('instruments') instruments?: string,
    @Query('saved') saved?: string,
    @Req() req?: any,
  ): Promise<TaskDTO[]> {
    const filters = {
      following: following === 'true',
      users: users ? users.split(',') : undefined,
      instruments: instruments ? instruments.split(',') : undefined,
      saved: saved === 'true',
      userId: req?.user?.id,
    };

    return this.tasksService.getAllTasks(filters);
  }

  @Get(':id')
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TaskDTO | null> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Req() req: any,
  ): Promise<TaskDTO> {
    return this.tasksService.createTask(createTaskDto, req.user.id);
  }
}
