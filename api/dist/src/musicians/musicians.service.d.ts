import { PrismaService } from '../prisma/prisma.service';
import { MusicianFrontendDTO } from './dto/musician.dto';
export declare class MusiciansService {
    private prisma;
    constructor(prisma: PrismaService);
    getMusicianById(id: number): Promise<MusicianFrontendDTO | null>;
}
