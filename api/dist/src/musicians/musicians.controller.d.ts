import { MusiciansService } from "./musicians.service";
import { CreateMusicianDto, MusicianDto, MusicianFrontendDTO } from "./dto/musician.dto";
export declare class MusiciansController {
    private readonly musiciansService;
    constructor(musiciansService: MusiciansService);
    getMusicianById(id: string): Promise<MusicianFrontendDTO>;
    createMusician(createMusicianDto: CreateMusicianDto): Promise<MusicianDto>;
}
