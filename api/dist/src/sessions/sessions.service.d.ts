import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto, FrontendSessionDto, NewCommentDto, NewGasUpDto } from './dto/session.dto';
import { CreatedCommentDto, CreatedGasUpDto } from 'src/musicians/dto/musician.dto';
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getFiveSessions(): Promise<FrontendSessionDto[]>;
    getSessionsChunk(cursorId?: number): Promise<FrontendSessionDto[]>;
    createSession(newSession: CreateSessionDto): Promise<FrontendSessionDto>;
    addComment(newComment: NewCommentDto): Promise<CreatedCommentDto>;
    addGasUp(newGasUp: NewGasUpDto): Promise<CreatedGasUpDto>;
}
