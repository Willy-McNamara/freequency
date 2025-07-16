import {
  Controller,
  Get,
  Post,
  Put,
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
  ProfileUpdateDto,
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

  @Get('all-id-names')
  async getAllIdNames(): Promise<{ id: number; displayName: string }[]> {
    return this.musiciansService.getAllIdNames();
  }

  @Get(':id')
  async getMusicianById(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<MusicianFrontendDTO | null> {
    const currentUserId = req.user?.id;
    return this.musiciansService.getMusicianById(Number(id), currentUserId);
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
  @UseGuards(JwtAuthGuard)
  async deleteGoal(
    @Param('id') id: string,
    @Param('goalId') goalId: string,
  ): Promise<void> {
    await this.musiciansService.deleteGoalForMusician(
      Number(id),
      Number(goalId),
    );
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  async followMusician(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    await this.musiciansService.followMusician(req.user.id, Number(id));
  }

  @Delete(':id/follow')
  @UseGuards(JwtAuthGuard)
  async unfollowMusician(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<void> {
    await this.musiciansService.unfollowMusician(req.user.id, Number(id));
  }

  @Get(':id/follow-status')
  @UseGuards(JwtAuthGuard)
  async getFollowStatus(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ isFollowing: boolean }> {
    return this.musiciansService.getFollowStatus(req.user.id, Number(id));
  }

  @Get(':id/follow-counts')
  async getFollowCounts(
    @Param('id') id: string,
  ): Promise<{ followerCount: number; followingCount: number }> {
    return this.musiciansService.getFollowCounts(Number(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() profileUpdateDto: ProfileUpdateDto,
    @Req() req: any,
  ): Promise<MusicianFrontendDTO> {
    // Ensure user can only update their own profile
    if (Number(id) !== req.user.id) {
      throw new Error('Unauthorized: Can only update your own profile');
    }
    return this.musiciansService.updateProfile(Number(id), profileUpdateDto);
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
