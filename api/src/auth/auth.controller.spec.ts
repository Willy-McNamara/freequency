import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MusiciansService } from '../musicians/musicians.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let musiciansService: jest.Mocked<MusiciansService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    createDebugToken: jest.fn(),
  };

  const mockMusiciansService = {
    findOrCreateMusician: jest.fn(),
    getMusicianById: jest.fn(),
  };

  const mockPrismaService = {
    musician: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MusiciansService, useValue: mockMusiciansService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    musiciansService = module.get(MusiciansService);
    prismaService = module.get(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleLogin', () => {
    it('should handle debug mode and redirect to frontend', async () => {
      const mockReq = { query: { debug: 'true' } };
      const mockRes = { redirect: jest.fn() };
      const mockDevUser = { id: 1, email: 'dev@example.com' };

      // Mock environment variables
      const originalEnv = process.env;
      process.env.NODE_ENV = 'development';
      process.env.FRONTEND_URL = 'http://localhost:5173';

      (prismaService.musician.findFirst as jest.Mock).mockResolvedValue(
        mockDevUser,
      );

      await controller.googleLogin(mockReq as any, mockRes as any);

      expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:5173');

      // Restore environment
      process.env = originalEnv;
    });

    it('should redirect to Google OAuth in normal mode', async () => {
      const mockReq = { query: {} };
      const mockRes = { redirect: jest.fn() };

      // Mock environment variables
      const originalEnv = process.env;
      process.env.NODE_ENV = 'production';

      await controller.googleLogin(mockReq as any, mockRes as any);

      expect(mockRes.redirect).toHaveBeenCalledWith('/auth/google');

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('googleOAuth', () => {
    it('should be defined', () => {
      expect(controller.googleOAuth).toBeDefined();
    });
  });

  describe('googleLoginCallback', () => {
    it('should handle callback and set cookie', async () => {
      const mockReq = { user: { token: 'test-token' } };
      const mockRes = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };

      // Mock environment variables
      const originalEnv = process.env;
      process.env.DEBUG = 'TRUE';
      process.env.FRONTEND_URL = 'http://localhost:5173';

      await controller.googleLoginCallback(mockReq as any, mockRes as any);

      expect(mockRes.cookie).toHaveBeenCalledWith('jwt', 'test-token', {
        httpOnly: true,
        secure: true,
      });
      expect(mockRes.redirect).toHaveBeenCalledWith('http://localhost:5173');

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const mockReq = { user: { id: 1 } };
      const mockMusicianData = {
        id: 1,
        displayName: 'Test User',
        bio: 'Test bio',
        instruments: [],
        profilePictureUrl: null,
        totalSessions: 0,
        totalPracticeSeconds: 0,
        totalGasUpsGiven: 0,
        totalGasUpsReceived: 0,
        createdAt: new Date(),
        goals: [],
      };

      (musiciansService.getMusicianById as jest.Mock).mockResolvedValue(
        mockMusicianData,
      );
      (prismaService.musician.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        displayName: 'Test User',
        avatarUrl: null,
      });

      const result = await controller.getCurrentUser(mockReq as any);

      expect(result).toEqual({
        id: 1,
        email: 'test@test.com',
        name: 'Test User',
        displayName: 'Test User',
        avatarUrl: null,
      });
      expect(musiciansService.getMusicianById).toHaveBeenCalledWith(1, 1);
    });

    it('should throw error when user not found', async () => {
      const mockReq = { user: { id: 999 } };

      (musiciansService.getMusicianById as jest.Mock).mockResolvedValue(null);

      await expect(controller.getCurrentUser(mockReq as any)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('logout', () => {
    it('should clear cookie and redirect', async () => {
      const mockRes = {
        clearCookie: jest.fn(),
        redirect: jest.fn(),
      };

      await controller.logout(mockRes as any);

      expect(mockRes.clearCookie).toHaveBeenCalledWith('jwt');
      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });
  });

  describe('debugLogin', () => {
    it('should handle debug login', async () => {
      const mockRes = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };

      // Mock environment variables
      const originalEnv = process.env;
      process.env.FRONTEND_URL = 'http://localhost:5173';

      (authService.createDebugToken as jest.Mock).mockResolvedValue(
        'debug-token',
      );

      await controller.debugLogin(mockRes as any);

      expect(mockRes.redirect).toHaveBeenCalledWith('/');

      // Restore environment
      process.env = originalEnv;
    });
  });
});
