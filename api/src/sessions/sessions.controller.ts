import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import {
  SessionDto,
  CreateSessionDto,
  NewCommentDto,
  CommentDto,
  NewGasUpDto,
  GasUpDto,
  FrontendSessionDto,
} from './dto/session.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  FrontendCommentDto,
  FrontendGasUpDto,
} from 'src/musicians/dto/musician.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async getSessionsOnRender(): Promise<SessionDto[]> {
    return this.sessionsService.getFiveSessions();
  }

  @Post('nextChunk')
  @UseGuards(JwtAuthGuard)
  async getNextChunk(@Body() body: any): Promise<SessionDto[]> {
    return this.sessionsService.getSessionsChunk(body.cursor);
  }

  @Post('newSession')
  @UseGuards(JwtAuthGuard)
  async createSession(
    @Body() body: any,
    @Req() req: any,
  ): Promise<FrontendSessionDto> {
    const newSession: CreateSessionDto = {
      title: body.title,
      notes: body.notes,
      duration: body.duration,
      isPublic: body.isPublic,
      musicianId: req.user.id,
    };
    return this.sessionsService.createSession(newSession);
  }

  @Post('addComment')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Body() body: any,
    @Req() req: any,
  ): Promise<FrontendCommentDto> {
    console.log('req.user.id:', req.user.id);
    const newComment: NewCommentDto = {
      text: body.text,
      musicianId: req.user.id,
      sessionId: body.sessionId,
    };
    console.log('addComment route hit. logging body:', newComment);
    return this.sessionsService.addComment(newComment);
  }

  @Post('addGasUp')
  @UseGuards(JwtAuthGuard)
  async addGasUp(
    @Body() body: any,
    @Req() req: any,
  ): Promise<FrontendGasUpDto> {
    console.log('req.user.id:', req.user.id);
    const newGasUp: NewGasUpDto = {
      gasserId: req.user.id, // the one doing the gassing up
      musicianId: body.musicianId, // the one getting gassed up
      sessionId: body.sessionId,
    };
    console.log('addGasUp route hit. logging body:', newGasUp);
    return this.sessionsService.addGasUp(newGasUp);
  }
}
