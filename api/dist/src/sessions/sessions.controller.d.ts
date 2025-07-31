import { SessionsService } from './sessions.service';
import { NewFrontendSessionDTO } from './dto/session.dto';
import { CreatedCommentDto, CreatedGasUpDto } from 'src/musicians/dto/musician.dto';
import { S3Service } from 'src/s3/s3.service';
import { MediaService } from 'src/media/media.service';
export declare class SessionsController {
    private readonly sessionsService;
    private readonly s3service;
    private readonly mediaService;
    constructor(sessionsService: SessionsService, s3service: S3Service, mediaService: MediaService);
    getSessions(req: any, cursor?: string, users?: string, instruments?: string, tags?: string, saved?: string, following?: string): Promise<{
        sessions: NewFrontendSessionDTO[];
        nextCursor?: string;
    }>;
    createSessionWithoutAudio(body: any, req: any): Promise<NewFrontendSessionDTO>;
    addComment(body: any, req: any): Promise<CreatedCommentDto>;
    addGasUp(body: any, req: any): Promise<CreatedGasUpDto>;
    removeGasUp(sessionId: string, req: any): Promise<{
        success: boolean;
    }>;
}
