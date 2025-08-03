/// <reference types="multer" />
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
    getSession(req: any, id: string): Promise<NewFrontendSessionDTO>;
    getSessions(req: any, cursor?: string, users?: string, instruments?: string, tags?: string, saved?: string, following?: string): Promise<{
        sessions: NewFrontendSessionDTO[];
        nextCursor?: string;
    }>;
    createSessionWithoutAudio(body: any, req: any): Promise<NewFrontendSessionDTO>;
    addComment(body: any, req: any): Promise<CreatedCommentDto>;
    addGasUp(body: any, req: any): Promise<CreatedGasUpDto>;
    getSignedUrl(body: any, req: any): Promise<{
        signedUrl: string;
    }>;
    connectMedia(body: any, req: any): Promise<any>;
    uploadMedia(file: Express.Multer.File, body: any, req: any): Promise<{
        url: string;
        fileName: string;
        thumbnailUrl?: string;
    }>;
}
