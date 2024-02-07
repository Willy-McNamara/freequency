import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSessionDto, SessionDto } from './dto/session.dto';
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllSessions(): Promise<SessionDto[]>;
    private mapGasUps;
    private mapComments;
    createSession(createSessionDto: CreateSessionDto): Promise<SessionDto>;
}
