import { MusiciansService } from './musicians.service';
import { MusicianFrontendDTO } from './dto/musician.dto';
export declare class MusiciansController {
    private readonly musiciansService;
    constructor(musiciansService: MusiciansService);
    getAllDisplayNames(): Promise<string[]>;
    getMusicianById(id: string): Promise<MusicianFrontendDTO>;
}
