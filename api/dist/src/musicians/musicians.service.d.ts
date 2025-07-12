import { PrismaService } from '../prisma/prisma.service';
import { CreateMusicianDto, MusicianDto, MusicianFrontendDTO, MusicianJwtDto, MusicianUpdateDto, GoalDto } from './dto/musician.dto';
export declare class MusiciansService {
    private prisma;
    constructor(prisma: PrismaService);
    getMusicianById(id: number): Promise<MusicianFrontendDTO | null>;
    getGoalsForMusician(musicianId: number): Promise<GoalDto[]>;
    createMusician(createMusicianDto: CreateMusicianDto): Promise<MusicianDto>;
    findOrCreateMusician(loginInfo: CreateMusicianDto): Promise<MusicianJwtDto>;
    formatMusicianForJwt(musician: any): MusicianJwtDto;
    updateMusician(musicianUpdateDto: MusicianUpdateDto): Promise<MusicianFrontendDTO>;
    formatMusicianForFrontend(musician: any): MusicianFrontendDTO;
    getAllDisplayNames(): Promise<string[]>;
}
