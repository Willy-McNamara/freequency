import { PrismaService } from 'src/prisma/prisma.service';
import { CommentDto, CreateSessionDto, FrontendSessionDto, GasUpDto, NewCommentDto, NewGasUpDto, SessionDto } from './dto/session.dto';
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllSessions(): Promise<FrontendSessionDto[]>;
    private mapGasUps;
    private mapComments;
    createSession(newSession: CreateSessionDto): Promise<SessionDto>;
    addComment(newComment: NewCommentDto): Promise<CommentDto>;
    addGasUp(newGasUp: NewGasUpDto): Promise<GasUpDto>;
}
