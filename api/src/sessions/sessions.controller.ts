import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionDto, CreateSessionDto } from './dto/session.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getAllSessions(): Promise<SessionDto[]> {
    return this.sessionsService.getAllSessions();
  }

  @Post('newSession')
  @UseGuards(JwtAuthGuard)
  async createSession(@Body() body: any, @Req() req: any): Promise<SessionDto> {
    const newSession: CreateSessionDto = {
      title: body.title,
      notes: body.notes,
      duration: body.duration,
      isPublic: body.isPublic,
      musicianId: req.user.id,
    };
    return this.sessionsService.createSession(newSession);
  }
}
