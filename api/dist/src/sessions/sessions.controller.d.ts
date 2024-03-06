import { SessionsService } from './sessions.service';
import { SessionDto, CommentDto, GasUpDto } from './dto/session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    getAllSessions(): Promise<SessionDto[]>;
    createSession(body: any, req: any): Promise<SessionDto>;
    addComment(body: any, req: any): Promise<CommentDto>;
    addGasUp(body: any, req: any): Promise<GasUpDto>;
}
