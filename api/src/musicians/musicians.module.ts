import { Module } from '@nestjs/common';
import { MusiciansService } from './musicians.service';
import { MusiciansController } from './musicians.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [MusiciansController],
  providers: [MusiciansService, PrismaService, JwtService],
  imports: [SharedModule],
})
export class MusiciansModule {}
