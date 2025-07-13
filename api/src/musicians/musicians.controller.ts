import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { MusiciansService } from './musicians.service';
import {
  CreateMusicianDto,
  MusicianDto,
  MusicianFrontendDTO,
  MusicianUpdateDto,
  GoalDto,
} from './dto/musician.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('musicians')
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

  @Get('all-display-names')
  async getAllDisplayNames(): Promise<string[]> {
    return this.musiciansService.getAllDisplayNames();
  }

  @Get(':id')
  async getMusicianById(@Param('id') id: string): Promise<MusicianFrontendDTO> {
    return this.musiciansService.getMusicianById(Number(id));
  }

  @Get(':id/goals')
  async getGoalsForMusician(@Param('id') id: string): Promise<GoalDto[]> {
    return this.musiciansService.getGoalsForMusician(Number(id));
  }

  @Post(':id/goals')
  async createGoalForMusician(
    @Param('id') id: string,
    @Body() goalDto: GoalDto,
  ): Promise<GoalDto> {
    return this.musiciansService.createGoalForMusician(Number(id), goalDto);
  }

  @Delete(':id/goals/:goalId')
  async deleteGoalForMusician(
    @Param('id') id: string,
    @Param('goalId') goalId: string,
  ): Promise<{ success: boolean }> {
    await this.musiciansService.deleteGoalForMusician(
      Number(id),
      Number(goalId),
    );
    return { success: true };
  }

  // // @Post()
  // // async createMusician(
  // //   @Body() createMusicianDto: CreateMusicianDto
  // // ): Promise<MusicianDto> {
  // //   return this.musiciansService.createMusician(createMusicianDto);
  // // }

  // @Post('update')
  // @UseGuards(JwtAuthGuard)
  // async updateMusician(
  //   @Body() body: any,
  //   @Req() req: any,
  // ): Promise<MusicianFrontendDTO> {
  //   const updateMusicianDto: MusicianUpdateDto = {
  //     id: req.user.id,
  //     updatedDisplayName: body.updatedDisplayName,
  //     updatedBio: body.updatedBio,
  //     updatedInstruments: body.updatedInstruments,
  //   };
  //   return this.musiciansService.updateMusician(updateMusicianDto);
  // }
}
