import { SessionsService } from './sessions.service';
import { SessionDto, FrontendSessionDto, CreateSessionResponse } from './dto/session.dto';
import { CreatedCommentDto, CreatedGasUpDto } from 'src/musicians/dto/musician.dto';
import { S3Service } from 'src/s3/s3.service';
import { MediaService } from 'src/media/media.service';
import { FrontendMedia } from 'src/media/media.dto';
export declare class SessionsController {
    private readonly sessionsService;
    private readonly s3service;
    private readonly mediaService;
    constructor(sessionsService: SessionsService, s3service: S3Service, mediaService: MediaService);
    getSessionsOnRender(): Promise<SessionDto[]>;
    getNextChunk(body: any): Promise<SessionDto[]>;
    createSessionWithoutAudio(body: any, req: any): Promise<FrontendSessionDto>;
    createSessionWithAudio(body: any, req: any): Promise<CreateSessionResponse>;
    confirmMedia(body: any): Promise<FrontendMedia>;
    addComment(body: any, req: any): Promise<CreatedCommentDto>;
    addGasUp(body: any, req: any): Promise<CreatedGasUpDto>;
}
