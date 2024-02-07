import { PrismaService } from "../prisma/prisma.service";
import { CreateMusicianDto, MusicianDto, MusicianFrontendDTO } from "./dto/musician.dto";
export declare class MusiciansService {
    private prisma;
    constructor(prisma: PrismaService);
    getMusicianById(id: number): Promise<MusicianFrontendDTO | null>;
    createMusician(createMusicianDto: CreateMusicianDto): Promise<MusicianDto>;
}
