import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionsService } from './sessions/sessions.service';
import { MusiciansService } from './musicians/musicians.service';
import { JwtAuthGuard } from './auth/jwt.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly musiciansService: MusiciansService,
    private readonly sessionsService: SessionsService,
  ) {}

  @Get('/initialRender')
  @UseGuards(JwtAuthGuard)
  async initialRender(@Req() req: any): Promise<any> {
    console.log(
      'logging req.user in initialRender, this is the return of jwtGuard',
      req.user,
    );
    const musicianData = await this.musiciansService.getMusicianById(
      req.user.id,
    );
    const sessionsData = await this.sessionsService.getAllSessions();
    const combinedData = this.appService.formatRenderPayload(
      musicianData,
      sessionsData,
    );

    return combinedData;
  }
}
