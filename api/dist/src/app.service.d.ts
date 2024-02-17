import { RenderPayloadDTO } from './dto/app.dto';
import { MusicianFrontendDTO } from 'src/musicians/dto/musician.dto';
import { FrontendSessionDto } from 'src/sessions/dto/session.dto';
export declare class AppService {
    formatRenderPayload(musicianData: MusicianFrontendDTO, sessionData: FrontendSessionDto[]): RenderPayloadDTO;
}
