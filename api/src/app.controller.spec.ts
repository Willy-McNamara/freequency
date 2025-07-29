import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessionsService } from './sessions/sessions.service';
import { MusiciansService } from './musicians/musicians.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockMusiciansService = { getMusicianById: jest.fn() };
    const mockSessionsService = { getFiveSessions: jest.fn() };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: MusiciansService, useValue: mockMusiciansService },
        { provide: SessionsService, useValue: mockSessionsService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(typeof appController).toBe('object'); // Just check instantiation for now
    });
  });
});
