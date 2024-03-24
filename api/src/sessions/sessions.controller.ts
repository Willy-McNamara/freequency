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
  AudioPayload,
  CreateSessionResponse,
} from './dto/session.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  FrontendCommentDto,
  FrontendGasUpDto,
} from 'src/musicians/dto/musician.dto';
import { S3Service } from 'src/s3/s3.service';
import crypto from 'crypto';
import { MediaService } from 'src/media/media.service';
import { FrontendMedia } from 'src/media/media.dto';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly s3service: S3Service,
    private readonly mediaService: MediaService,
  ) {}

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
  ): Promise<CreateSessionResponse> {
    const audioPayload = {
      size: body.audioPayload.fileSize, // file.size
      type: body.audioPayload.fileType, // file.type
      checksum: body.audioPayload.checksum,
      musicianId: req.user.id,
    };

    // this logic is in the contorller so it can feed into both getSignedURL and createSession
    const generateFileName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString('hex');
    const fileName = generateFileName();
    const url = await this.s3service.getSignedURL(audioPayload, fileName);

    const createSession: CreateSessionDto = {
      title: body.title,
      notes: body.notes,
      instruments: body.instruments,
      duration: body.duration,
      isPublic: body.isPublic,
      musicianId: req.user.id,
    };
    const newSession: FrontendSessionDto =
      await this.sessionsService.createSession(createSession);

    const newMedia = await this.mediaService.addMediaItem(
      fileName,
      newSession.musicianId,
      'audio',
      newSession.id,
    );

    return { newSession, newMedia, signedUrl: url };
  }

  @Post('confirmMedia')
  @UseGuards(JwtAuthGuard)
  async confirmMedia(@Body() body: any): Promise<FrontendMedia> {
    return this.mediaService.connectMediaToSession(
      body.mediaId,
      body.sessionId,
    );
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
