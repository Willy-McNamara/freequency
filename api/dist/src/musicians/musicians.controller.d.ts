import { MusiciansService } from './musicians.service';
import { MusicianFrontendDTO } from './dto/musician.dto';
export declare class MusiciansController {
    private readonly musiciansService;
    constructor(musiciansService: MusiciansService);
    getMusicianById(id: string): Promise<MusicianFrontendDTO>;
    updateMusician(body: any, req: any): Promise<MusicianFrontendDTO>;
}
