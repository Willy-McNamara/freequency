import { Controller, Get, Post, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionDto, CreateSessionDto } from './dto/session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getAllSessions(): Promise<SessionDto[]> {
    return this.sessionsService.getAllSessions();
  }

  @Post()
  async createSession(@Body() reqBody: CreateSessionDto): Promise<SessionDto> {
    /*
    testing our create session route
    return this.sessionsService.createSession(createSessionDto);
    */
    console.log('logging request body in createSession :', reqBody);
    await setTimeout(() => {}, 2000);
    return new SessionDto();
  }
}
