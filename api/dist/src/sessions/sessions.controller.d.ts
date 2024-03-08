import { SessionsService } from './sessions.service';
import { SessionDto, FrontendSessionDto } from './dto/session.dto';
import { FrontendCommentDto, FrontendGasUpDto } from 'src/musicians/dto/musician.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    getSessionsOnRender(): Promise<SessionDto[]>;
    getNextChunk(body: any): Promise<SessionDto[]>;
    createSession(body: any, req: any): Promise<FrontendSessionDto>;
    addComment(body: any, req: any): Promise<FrontendCommentDto>;
    addGasUp(body: any, req: any): Promise<FrontendGasUpDto>;
}
