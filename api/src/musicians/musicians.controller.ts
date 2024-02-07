import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { MusiciansService } from "./musicians.service";
import {
  CreateMusicianDto,
  MusicianDto,
  MusicianFrontendDTO,
} from "./dto/musician.dto";

@Controller("musicians")
export class MusiciansController {
  constructor(private readonly musiciansService: MusiciansService) {}

  @Get()
  async getMusicianById(@Param("id") id: string): Promise<MusicianFrontendDTO> {
    return this.musiciansService.getMusicianById(Number(id));
  }

  @Post()
  async createMusician(
    @Body() createMusicianDto: CreateMusicianDto
  ): Promise<MusicianDto> {
    return this.musiciansService.createMusician(createMusicianDto);
  }
}
