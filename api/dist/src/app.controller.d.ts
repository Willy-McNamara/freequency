import { AppService } from './app.service';
import { SessionsService } from './sessions/sessions.service';
import { MusiciansService } from './musicians/musicians.service';
export declare class AppController {
    private readonly appService;
    private readonly musiciansService;
    private readonly sessionsService;
    constructor(appService: AppService, musiciansService: MusiciansService, sessionsService: SessionsService);
    initialRender(req: any): Promise<any>;
}
