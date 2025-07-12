import { MusicianFrontendDTO } from 'src/musicians/dto/musician.dto';
import { NewFrontendSessionDTO } from 'src/sessions/dto/session.dto';

export class RenderPayloadDTO {
  musician: MusicianFrontendDTO;
  feed: NewFrontendSessionDTO[];
}
