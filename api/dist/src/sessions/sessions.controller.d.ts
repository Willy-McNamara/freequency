import { SessionsService } from './sessions.service';
import { NewFrontendSessionDTO } from './dto/session.dto';
import { S3Service } from 'src/s3/s3.service';
import { MediaService } from 'src/media/media.service';
export declare class SessionsController {
    private readonly sessionsService;
    private readonly s3service;
    private readonly mediaService;
    constructor(sessionsService: SessionsService, s3service: S3Service, mediaService: MediaService);
    getSessionsOnRender(cursor?: string, users?: string, instruments?: string, tags?: string, saved?: string): Promise<{
        sessions: NewFrontendSessionDTO[];
        nextCursor?: string;
    }>;
    createSessionWithoutAudio(body: any, req: any): Promise<NewFrontendSessionDTO>;
}
