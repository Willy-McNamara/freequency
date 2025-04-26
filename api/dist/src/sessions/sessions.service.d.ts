import { PrismaService } from 'src/prisma/prisma.service';
import { NewFrontendSessionDTO } from './dto/session.dto';
export declare class SessionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getFiveSessions(): Promise<NewFrontendSessionDTO[]>;
}
