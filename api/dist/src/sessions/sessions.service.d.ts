import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto, FrontendSessionDto, SessionDto } from './dto/session.dto';
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllSessions(): Promise<FrontendSessionDto[]>;
    private mapGasUps;
    private mapComments;
    createSession(newSession: CreateSessionDto): Promise<SessionDto>;
}
