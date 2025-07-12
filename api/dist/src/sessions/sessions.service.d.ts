import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto, NewCommentDto, NewFrontendSessionDTO, NewGasUpDto } from './dto/session.dto';
import { CreatedCommentDto, CreatedGasUpDto } from 'src/musicians/dto/musician.dto';
interface SessionFilters {
    users: string[];
    instruments: string[];
    tags: string[];
    saved: boolean;
}
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSessionsWithFilters(filters: SessionFilters, cursor?: string): Promise<{
        sessions: NewFrontendSessionDTO[];
        nextCursor?: string;
    }>;
    getFiveSessions(): Promise<NewFrontendSessionDTO[]>;
    createSession(newSession: CreateSessionDto): Promise<NewFrontendSessionDTO>;
    addComment(newComment: NewCommentDto): Promise<CreatedCommentDto>;
    addGasUp(newGasUp: NewGasUpDto): Promise<CreatedGasUpDto>;
}
export {};
