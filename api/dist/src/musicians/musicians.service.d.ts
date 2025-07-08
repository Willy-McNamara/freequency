import { PrismaService } from '../prisma/prisma.service';
import { MusicianFrontendDTO, GoalDto } from './dto/musician.dto';
export declare class MusiciansService {
    private prisma;
    constructor(prisma: PrismaService);
    getMusicianById(id: number): Promise<MusicianFrontendDTO | null>;
    getGoalsForMusician(musicianId: number): Promise<GoalDto[]>;
    getAllDisplayNames(): Promise<string[]>;
}
