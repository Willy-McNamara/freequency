import { PrismaService } from '../prisma/prisma.service';
import { CreateMusicianDto, MusicianDto, MusicianFrontendDTO, MusicianJwtDto, MusicianUpdateDto } from './dto/musician.dto';
export declare class MusiciansService {
    private prisma;
    constructor(prisma: PrismaService);
    getMusicianById(id: number): Promise<MusicianFrontendDTO | null>;
    createMusician(createMusicianDto: CreateMusicianDto): Promise<MusicianDto>;
    findOrCreateMusician(loginInfo: CreateMusicianDto): Promise<MusicianJwtDto>;
    formatMusicianForJwt(musician: MusicianDto): MusicianJwtDto;
    updateMusician(musicianUpdateDto: MusicianUpdateDto): Promise<MusicianFrontendDTO>;
    formatMusicianForFrontend(musician: MusicianDto): MusicianFrontendDTO;
}
