import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto, NewCommentDto, NewFrontendSessionDTO, NewGasUpDto } from './dto/session.dto';
import { CreatedCommentDto, CreatedGasUpDto } from 'src/musicians/dto/musician.dto';
interface SessionFilters {
    userIds: number[];
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
    getSessionsFromFollowedUsers(currentUserId: number, cursor?: string): Promise<{
        sessions: NewFrontendSessionDTO[];
        nextCursor?: string;
    }>;
    getFollowedUserDisplayNames(currentUserId: number): Promise<string[]>;
    getFollowedUserIds(currentUserId: number): Promise<number[]>;
    createSession(newSession: CreateSessionDto): Promise<NewFrontendSessionDTO>;
    addComment(newComment: NewCommentDto): Promise<CreatedCommentDto>;
    addGasUp(newGasUp: NewGasUpDto): Promise<CreatedGasUpDto>;
}
export {};
