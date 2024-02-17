import { MusicianFrontendDTO } from './musicians.types';
import { FrontendSessionDto } from './sessions.types';

export type RenderPayloadDTO = {
  musician: MusicianFrontendDTO;
  feed: FrontendSessionDto[];
};
