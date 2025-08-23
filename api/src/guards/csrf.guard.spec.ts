import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { CSRFGuard } from './csrf.guard';
import { CSRFService } from '../services/csrf.service';

describe('CSRFGuard', () => {
  let guard: CSRFGuard;
  let csrfService: jest.Mocked<CSRFService>;

  const mockExecutionContext = (
    method: string,
    path: string,
    user?: any,
    headers?: any,
  ) => {
    const request = {
      method,
      path,
      user,
      headers: headers || {},
      body: {},
      query: {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    };
  };

  beforeEach(async () => {
    const mockCSRFService = {
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CSRFGuard,
        {
          provide: CSRFService,
          useValue: mockCSRFService,
        },
      ],
    }).compile();

    guard = module.get<CSRFGuard>(CSRFGuard);
    csrfService = module.get(CSRFService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('Safe HTTP methods', () => {
    it('should allow GET requests without CSRF validation', async () => {
      const context = mockExecutionContext('GET', '/tasks');
      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
    });

    it('should allow HEAD requests without CSRF validation', async () => {
      const context = mockExecutionContext('HEAD', '/tasks');
      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
    });

    it('should allow OPTIONS requests without CSRF validation', async () => {
      const context = mockExecutionContext('OPTIONS', '/tasks');
      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
    });
  });

  describe('State-changing HTTP methods', () => {
    it('should require CSRF validation for POST requests', async () => {
      const context = mockExecutionContext(
        'POST',
        '/tasks',
        { id: 1 },
        {
          'x-csrf-token': 'valid-token-123',
        },
      );
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'valid-token-123',
      );
    });

    it('should require CSRF validation for PUT requests', async () => {
      const context = mockExecutionContext(
        'PUT',
        '/tasks/1',
        { id: 1 },
        {
          'x-csrf-token': 'valid-token-456',
        },
      );
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'valid-token-456',
      );
    });

    it('should require CSRF validation for PATCH requests', async () => {
      const context = mockExecutionContext(
        'PATCH',
        '/tasks/1',
        { id: 1 },
        {
          'x-csrf-token': 'valid-token-789',
        },
      );
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'valid-token-789',
      );
    });

    it('should require CSRF validation for DELETE requests', async () => {
      const context = mockExecutionContext(
        'DELETE',
        '/tasks/1',
        { id: 1 },
        {
          'x-csrf-token': 'valid-token-abc',
        },
      );
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'valid-token-abc',
      );
    });
  });

  describe('User authentication', () => {
    it('should skip CSRF validation when no user is authenticated', async () => {
      const context = mockExecutionContext('POST', '/tasks');
      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).not.toHaveBeenCalled();
    });

    it('should proceed with CSRF validation when user is authenticated', async () => {
      const context = mockExecutionContext(
        'POST',
        '/tasks',
        { id: 1 },
        {
          'x-csrf-token': 'valid-token-123',
        },
      );
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'valid-token-123',
      );
    });
  });

  describe('CSRF token extraction', () => {
    it('should extract token from X-CSRF-Token header', async () => {
      const context = mockExecutionContext(
        'POST',
        '/tasks',
        { id: 1 },
        {
          'x-csrf-token': 'header-token-123',
        },
      );
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'header-token-123',
      );
    });

    it('should extract token from _csrf form field', async () => {
      const context = mockExecutionContext('POST', '/tasks', { id: 1 });
      const request = context.switchToHttp().getRequest();
      request.body = { _csrf: 'form-token-123' };
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'form-token-123',
      );
    });

    it('should extract token from _csrf query parameter', async () => {
      const context = mockExecutionContext('POST', '/tasks', { id: 1 });
      const request = context.switchToHttp().getRequest();
      request.query = { _csrf: 'query-token-123' };
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'query-token-123',
      );
    });

    it('should prioritize X-CSRF-Token header over other sources', async () => {
      const context = mockExecutionContext(
        'POST',
        '/tasks',
        { id: 1 },
        {
          'x-csrf-token': 'header-token-123',
        },
      );
      const request = context.switchToHttp().getRequest();
      request.body = { _csrf: 'form-token-456' };
      request.query = { _csrf: 'query-token-789' };
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).toHaveBeenCalledWith(
        1,
        'header-token-123',
      );
    });
  });

  describe('CSRF token validation', () => {
    it('should throw UnauthorizedException when no CSRF token is provided', async () => {
      const context = mockExecutionContext('POST', '/tasks', { id: 1 });
      csrfService.validateToken.mockResolvedValue(false);

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow('CSRF token required');
    });

    it('should throw UnauthorizedException when CSRF token is invalid', async () => {
      const context = mockExecutionContext(
        'POST',
        '/tasks',
        { id: 1 },
        {
          'x-csrf-token': 'invalid-token',
        },
      );
      csrfService.validateToken.mockResolvedValue(false);

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow('Invalid CSRF token');
    });

    it('should allow request when CSRF token is valid', async () => {
      const context = mockExecutionContext(
        'POST',
        '/tasks',
        { id: 1 },
        {
          'x-csrf-token': 'valid-token',
        },
      );
      csrfService.validateToken.mockResolvedValue(true);

      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
    });
  });

  describe('Excluded paths', () => {
    it('should skip CSRF validation for /auth/csrf-token', async () => {
      const context = mockExecutionContext('POST', '/auth/csrf-token', {
        id: 1,
      });
      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).not.toHaveBeenCalled();
    });

    it('should skip CSRF validation for /health', async () => {
      const context = mockExecutionContext('POST', '/health', { id: 1 });
      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).not.toHaveBeenCalled();
    });

    it('should skip CSRF validation for webhook endpoints', async () => {
      const context = mockExecutionContext('POST', '/webhooks/stripe', {
        id: 1,
      });
      const result = await guard.canActivate(context as ExecutionContext);
      expect(result).toBe(true);
      expect(csrfService.validateToken).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle CSRF service errors gracefully', async () => {
      const context = mockExecutionContext(
        'POST',
        '/tasks',
        { id: 1 },
        {
          'x-csrf-token': 'valid-token',
        },
      );
      csrfService.validateToken.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow('CSRF validation failed');
    });

    it('should preserve original UnauthorizedException messages', async () => {
      const context = mockExecutionContext('POST', '/tasks', { id: 1 });
      // No token provided

      await expect(
        guard.canActivate(context as ExecutionContext),
      ).rejects.toThrow('CSRF token required');
    });
  });
});
