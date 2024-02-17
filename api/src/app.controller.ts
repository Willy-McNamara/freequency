import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionsService } from './sessions/sessions.service';
import { MusiciansService } from './musicians/musicians.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly musiciansService: MusiciansService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Get('/initialRender')
  async initialRender(): Promise<any> {
    const musicianData = await this.musiciansService.getMusicianById(1);
    const sessionsData = await this.sessionsService.getAllSessions();
    const combinedData = this.appService.formatRenderPayload(
      musicianData,
      sessionsData,
    );

    return combinedData;
  }
}
