import { MusicianFrontendDTO } from 'src/musicians/dto/musician.dto';
import { FrontendSessionDto } from 'src/sessions/dto/session.dto';

export class RenderPayloadDTO {
  musician: MusicianFrontendDTO;
  feed: FrontendSessionDto[];
}
