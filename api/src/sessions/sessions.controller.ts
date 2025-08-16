import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { SessionsService } from './sessions.service';
import {
  CreateSessionDto,
  NewFrontendSessionDTO,
  NewCommentDto,
  NewGasUpDto,
} from './dto/session.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import {
  CreatedCommentDto,
  CreatedGasUpDto,
} from 'src/musicians/dto/musician.dto';
import { S3Service } from 'src/s3/s3.service';
import { MediaService } from 'src/media/media.service';
import { FileSecurityService } from '../services/file-security.service';

@Controller('sessions')
export class SessionsController {
  constructor(
    private readonly sessionsService: SessionsService,
    private readonly s3service: S3Service,
    private readonly mediaService: MediaService,
    private readonly fileSecurityService: FileSecurityService,
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSession(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<NewFrontendSessionDTO> {
    return this.sessionsService.getSession(parseInt(id));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSessions(
    @Req() req: any,
    @Query('cursor') cursor?: string,
    @Query('users') users?: string,
    @Query('instruments') instruments?: string,
    @Query('tags') tags?: string,
    @Query('saved') saved?: string,
    @Query('following') following?: string,
  ): Promise<{ sessions: NewFrontendSessionDTO[]; nextCursor?: string }> {
    // Removed debug logs
    let userIdList = users
      ? users
          .split(',')
          .map((id) => parseInt(id, 10))
          .filter((id) => !isNaN(id))
      : [];
    if (following === 'true') {
      const followedUserIds = await this.sessionsService.getFollowedUserIds(
        req.user.id,
      );
      userIdList = Array.from(new Set([...userIdList, ...followedUserIds]));
    }
    return this.sessionsService.getSessionsWithFilters(
      {
        userIds: userIdList,
        instruments: instruments ? instruments.split(',') : [],
        tags: tags ? tags.split(',') : [],
        saved: saved === 'true',
      },
      cursor,
    );
  }

  // @Post('nextChunk')
  // @UseGuards(JwtAuthGuard)
  // async getNextChunk(@Body() body: any): Promise<SessionDto[]> {
  //   return this.sessionsService.getSessionsChunk(body.cursor);
  // }

  @Post('newSessionWithoutAudio')
  @UseGuards(JwtAuthGuard)
  async createSessionWithoutAudio(
    @Body() body: any,
    @Req() req: any,
  ): Promise<NewFrontendSessionDTO> {
    // Expecting: { title, notes, instruments: number[], tags: number[], duration }
    const createSession: CreateSessionDto = {
      title: body.title,
      notes: body.notes,
      instruments: body.instruments, // array of instrument IDs
      tags: body.tags, // array of tag IDs
      duration: body.duration,
      isPublic: true, // all sessions public for now
      musicianId: req.user.id,
      tasks: body.tasks || [], // array of task data
    };
    const newSession: NewFrontendSessionDTO =
      await this.sessionsService.createSession(createSession);

    return newSession;
  }

  // @Post('newSessionWithAudio')
  // @UseGuards(JwtAuthGuard)
  // async createSessionWithAudio(
  //   @Body() body: any,
  //   @Req() req: any,
  // ): Promise<CreateSessionResponse> {
  //   const audioPayload = {
  //     size: body.audioPayload.fileSize, // file.size
  //     type: body.audioPayload.fileType, // file.type
  //     checksum: body.audioPayload.checksum,
  //     musicianId: req.user.id,
  //   };

  //   // this logic is in the contorller so it can feed into both getSignedURL and createSession
  //   const generateFileName = (bytes = 32) =>
  //     crypto.randomBytes(bytes).toString('hex');
  //   const fileName = generateFileName();
  //   const url = await this.s3service.getSignedURL(audioPayload, fileName);

  //   const createSession: CreateSessionDto = {
  //     title: body.title,
  //     notes: body.notes,
  //     instruments: body.instruments,
  //     duration: body.duration,
  //     isPublic: body.isPublic,
  //     musicianId: req.user.id,
  //   };
  //   const newSession: FrontendSessionDto =
  //     await this.sessionsService.createSession(createSession);

  //   const newMedia = await this.mediaService.addMediaItem(
  //     fileName,
  //     newSession.musicianId,
  //     'audio',
  //     newSession.id,
  //   );

  //   return { newSession, newMedia, signedUrl: url };
  // }

  // @Post('confirmMedia')
  // @UseGuards(JwtAuthGuard)
  // async confirmMedia(@Body() body: any): Promise<FrontendMedia> {
  //   return this.mediaService.connectMediaToSession(
  //     body.mediaId,
  //     body.sessionId,
  //   );
  // }

  @Post('addComment')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Body() body: any,
    @Req() req: any,
  ): Promise<CreatedCommentDto> {
    const newComment: NewCommentDto = {
      text: body.text,
      musicianId: req.user.id,
      sessionId: body.sessionId,
    };
    return this.sessionsService.addComment(newComment);
  }

  @Post('addGasUp')
  @UseGuards(JwtAuthGuard)
  async addGasUp(@Body() body: any, @Req() req: any): Promise<CreatedGasUpDto> {
    const newGasUp: NewGasUpDto = {
      gasserId: req.user.id, // the one doing the gassing up
      musicianId: body.musicianId, // the one getting gassed up
      sessionId: body.sessionId,
    };
    return this.sessionsService.addGasUp(newGasUp);
  }

  @Post('signed-url')
  @UseGuards(JwtAuthGuard)
  async getSignedUrl(
    @Body() body: any,
    @Req() req: any,
  ): Promise<{ signedUrl: string }> {
    const { size, type, fileName } = body;

    const filePayload = {
      size,
      type,
      musicianId: req.user.id,
    };

    const signedUrl = await this.s3service.getSignedURL(filePayload, fileName);

    if (
      signedUrl.startsWith('File size') ||
      signedUrl.startsWith('File type')
    ) {
      throw new Error(signedUrl);
    }

    return { signedUrl };
  }

  @Post('connect-media')
  @UseGuards(JwtAuthGuard)
  async connectMedia(@Body() body: any, @Req() req: any): Promise<any> {
    const { fileName, sessionId, displayName, thumbnailUrl } = body;

    // Determine media type from file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let mediaType: 'image' | 'audio' | 'video';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
      mediaType = 'image';
    } else if (
      ['mp3', 'wav', 'm4a', 'ogg', 'webm'].includes(fileExtension || '')
    ) {
      mediaType = 'audio';
    } else if (
      ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(fileExtension || '')
    ) {
      mediaType = 'video';
    } else {
      throw new Error('Unsupported file type');
    }

    // Check media limits
    const session = await this.sessionsService.getSession(sessionId);
    const photoCount = session.media.filter((m) => m.type === 'image').length;
    const audioCount = session.media.filter((m) => m.type === 'audio').length;
    const videoCount = session.media.filter((m) => m.type === 'video').length;

    if (mediaType === 'image' && photoCount >= 4) {
      throw new Error('Maximum 4 photos allowed per session');
    }

    if (mediaType === 'audio' && audioCount >= 3) {
      throw new Error('Maximum 3 audio recordings allowed per session');
    }

    if (mediaType === 'video' && videoCount >= 1) {
      throw new Error('Maximum 1 video allowed per session');
    }

    const newMedia = await this.mediaService.addMediaItem(
      fileName,
      req.user.id,
      mediaType,
      sessionId,
      displayName,
      thumbnailUrl,
    );

    return newMedia;
  }

  @Post('upload-media')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: any,
  ): Promise<{ url: string; fileName: string; thumbnailUrl?: string }> {
    const { sessionId } = body;

    // Comprehensive file security validation
    const fileSecurityInfo = {
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
      checksum: this.fileSecurityService.generateChecksum(file.buffer),
    };

    const validationResult =
      await this.fileSecurityService.validateFile(fileSecurityInfo);

    if (!validationResult.isValid || !validationResult.isSafe) {
      // Log security event
      this.fileSecurityService.logSecurityEvent(
        fileSecurityInfo,
        validationResult,
        req.ip || req.connection?.remoteAddress || 'unknown',
      );

      throw new BadRequestException({
        message: 'File upload blocked for security reasons',
        errors: validationResult.errors,
      });
    }

    // Generate filename
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `media/${req.user.id}/${timestamp}.${fileExtension}`;

    // Upload to S3
    const uploadResult = await this.s3service.uploadFile(
      file.buffer,
      fileName,
      file.mimetype,
      req.user.id,
    );

    // Connect to session if provided
    if (sessionId) {
      await this.connectMedia(
        {
          fileName,
          sessionId: parseInt(sessionId),
        },
        req,
      );
    }

    return {
      url: uploadResult.url,
      fileName: fileName, // Use the actual S3 key, not originalname
      thumbnailUrl: uploadResult.thumbnailUrl,
    };
  }
}
