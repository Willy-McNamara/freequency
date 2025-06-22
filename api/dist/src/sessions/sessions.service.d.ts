import { PrismaService } from 'src/prisma/prisma.service';
import { NewFrontendSessionDTO } from './dto/session.dto';
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
}
export {};
