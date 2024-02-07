import { Controller, Get, Post, Body } from "@nestjs/common";
import { SessionsService } from "./sessions.service";
import { SessionDto, CreateSessionDto } from "./dto/session.dto";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getAllSessions(): Promise<SessionDto[]> {
    return this.sessionsService.getAllSessions();
  }

  @Post()
  async createSession(
    @Body() createSessionDto: CreateSessionDto
  ): Promise<SessionDto> {
    return this.sessionsService.createSession(createSessionDto);
  }
}
