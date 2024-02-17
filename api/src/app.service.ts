import { Injectable } from '@nestjs/common';
import { RenderPayloadDTO } from './dto/app.dto';
import { MusicianFrontendDTO } from 'src/musicians/dto/musician.dto';
import { FrontendSessionDto } from 'src/sessions/dto/session.dto';

@Injectable()
export class AppService {
  formatRenderPayload(
    musicianData: MusicianFrontendDTO,
    sessionData: FrontendSessionDto[],
  ): RenderPayloadDTO {
    return {
      musician: musicianData,
      feed: sessionData,
    };
  }
}
