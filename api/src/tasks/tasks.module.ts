import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksInUseService } from './tasks-in-use.service';
import { TasksInUseController } from './tasks-in-use.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController, TasksInUseController],
  providers: [TasksService, TasksInUseService],
  exports: [TasksService],
})
export class TasksModule {}
