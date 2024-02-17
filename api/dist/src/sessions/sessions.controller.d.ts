import { SessionsService } from './sessions.service';
import { SessionDto, CreateSessionDto } from './dto/session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    getAllSessions(): Promise<SessionDto[]>;
    createSession(reqBody: CreateSessionDto): Promise<SessionDto>;
}
