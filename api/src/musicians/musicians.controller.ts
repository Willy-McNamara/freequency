import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MusiciansService } from './musicians.service';
import {
  CreateMusicianDto,
  MusicianDto,
  MusicianFrontendDTO,
  MusicianUpdateDto,
} from './dto/musician.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('musicians')
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

  @Get()
  async getMusicianById(@Param('id') id: string): Promise<MusicianFrontendDTO> {
    return this.musiciansService.getMusicianById(Number(id));
  }

  // @Post()
  // async createMusician(
  //   @Body() createMusicianDto: CreateMusicianDto
  // ): Promise<MusicianDto> {
  //   return this.musiciansService.createMusician(createMusicianDto);
  // }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateMusician(
    @Body() body: any,
    @Req() req: any,
  ): Promise<MusicianFrontendDTO> {
    const updateMusicianDto: MusicianUpdateDto = {
      id: req.user.id,
      updatedDisplayName: body.updatedDisplayName,
      updatedBio: body.updatedBio,
      updatedInstruments: body.updatedInstruments,
    };
    console.log('updateMusicianDto', updateMusicianDto);
    return this.musiciansService.updateMusician(updateMusicianDto);
  }
}
