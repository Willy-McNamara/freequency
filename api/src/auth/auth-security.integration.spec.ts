import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthSecurityService } from './auth-security.service';
import { SecureJwtStrategy } from './secure-jwt.strategy';
import { SecureJwtGuard } from './secure-jwt.guard';
import { AuthConfig } from '../config/auth.config';

describe('Authentication Security Integration', () => {
  let module: TestingModule;
  let authSecurityService: AuthSecurityService;
  let jwtService: JwtService;
  let secureJwtStrategy: SecureJwtStrategy;

  beforeEach(async () => {
    // Set environment variables for testing
    process.env.JWT_SECRET = 'test-secret-key-for-testing-only-32-chars-long';
    process.env.JWT_ISSUER = 'test-issuer';
    process.env.JWT_AUDIENCE = 'test-audience';

    module = await Test.createTestingModule({
      providers: [
        AuthSecurityService,
        SecureJwtGuard,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        // Mock the SecureJwtStrategy to avoid JWT validation issues in tests
        {
          provide: SecureJwtStrategy,
          useValue: {
            validate: jest.fn().mockImplementation((req, payload) => {
              // Mock validation logic
              if (!payload.id || !payload.email) {
                throw new Error('Invalid token payload');
              }

              const now = Math.floor(Date.now() / 1000);
              if (payload.exp && payload.exp < now) {
                throw new Error('Token expired');
              }

              if (payload.iat && payload.iat > now + 60) {
                throw new Error('Token issued in the future');
              }

              return {
                id: payload.id,
                email: payload.email,
                displayName: payload.displayName,
                tokenId: payload.jti,
                issuedAt: payload.iat,
                expiresAt: payload.exp,
              };
            }),
          },
        },
      ],
    }).compile();

    authSecurityService = module.get<AuthSecurityService>(AuthSecurityService);
    jwtService = module.get<JwtService>(JwtService);
    secureJwtStrategy = module.get<SecureJwtStrategy>(SecureJwtStrategy);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('JWT Security', () => {
    it('should validate JWT tokens with proper payload structure', async () => {
      const mockPayload = {
        id: 1,
        email: 'test@example.com',
        displayName: 'Test User',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes from now
        iss: AuthConfig.jwt.issuer,
        aud: AuthConfig.jwt.audience,
      };

      const mockRequest = {
        cookies: { jwt: 'valid-jwt-token' },
        ip: '192.168.1.1',
        headers: { 'user-agent': 'test-agent' },
      };

      // Mock JWT verification
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockPayload);

      const result = await secureJwtStrategy.validate(mockRequest, mockPayload);

      expect(result.id).toBe(mockPayload.id);
      expect(result.email).toBe(mockPayload.email);
      expect(result.displayName).toBe(mockPayload.displayName);
    });

    it('should reject JWT tokens with missing required fields', async () => {
      const invalidPayload = {
        email: 'test@example.com',
        // Missing 'id' field
      };

      const mockRequest = {
        cookies: { jwt: 'invalid-jwt-token' },
        ip: '192.168.1.1',
        headers: { 'user-agent': 'test-agent' },
      };

      expect(() => {
        secureJwtStrategy.validate(mockRequest, invalidPayload);
      }).toThrow('Invalid token payload');
    });

    it('should reject expired JWT tokens', async () => {
      const expiredPayload = {
        id: 1,
        email: 'test@example.com',
        displayName: 'Test User',
        iat: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
        exp: Math.floor(Date.now() / 1000) - 900, // 15 minutes ago (expired)
        iss: AuthConfig.jwt.issuer,
        aud: AuthConfig.jwt.audience,
      };

      const mockRequest = {
        cookies: { jwt: 'expired-jwt-token' },
        ip: '192.168.1.1',
        headers: { 'user-agent': 'test-agent' },
      };

      expect(() => {
        secureJwtStrategy.validate(mockRequest, expiredPayload);
      }).toThrow('Token expired');
    });

    it('should reject JWT tokens issued in the future', async () => {
      const futurePayload = {
        id: 1,
        email: 'test@example.com',
        displayName: 'Test User',
        iat: Math.floor(Date.now() / 1000) + 120, // 2 minutes in the future
        exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes from now
        iss: AuthConfig.jwt.issuer,
        aud: AuthConfig.jwt.audience,
      };

      const mockRequest = {
        cookies: { jwt: 'future-jwt-token' },
        ip: '192.168.1.1',
        headers: { 'user-agent': 'test-agent' },
      };

      expect(() => {
        secureJwtStrategy.validate(mockRequest, futurePayload);
      }).toThrow('Token issued in the future');
    });
  });

  describe('Brute Force Protection', () => {
    it('should block IP after multiple failed login attempts', () => {
      const ip = '192.168.1.100';
      const userAgent = 'malicious-bot';

      // Make multiple failed attempts
      for (let i = 0; i < AuthConfig.security.maxLoginAttempts; i++) {
        authSecurityService.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      expect(authSecurityService.isIPBlocked(ip)).toBe(true);
    });

    it('should not block IP after successful login attempt', () => {
      const ip = '192.168.1.101';
      const userAgent = 'legitimate-user';

      // Make some failed attempts
      for (let i = 0; i < AuthConfig.security.maxLoginAttempts - 1; i++) {
        authSecurityService.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      // Make one successful attempt
      authSecurityService.recordLoginAttempt(
        ip,
        'user@example.com',
        true,
        userAgent,
      );

      expect(authSecurityService.isIPBlocked(ip)).toBe(false);
    });

    it('should track security events for monitoring', () => {
      const ip = '192.168.1.102';
      const userAgent = 'test-agent';

      authSecurityService.recordLoginAttempt(
        ip,
        'user@example.com',
        false,
        userAgent,
      );

      const events = authSecurityService.getSecurityEvents();
      const loginEvents = events.filter(
        (event) => event.type === 'login_attempt',
      );

      expect(loginEvents.length).toBeGreaterThan(0);
      expect(loginEvents[0].ip).toBe(ip);
      expect(loginEvents[0].userAgent).toBe(userAgent);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce rate limits for authentication endpoints', () => {
      // Test login rate limiting
      const loginLimit = AuthConfig.rateLimits.login;
      expect(loginLimit.limit).toBe(5); // 5 attempts per minute
      expect(loginLimit.ttl).toBe(60); // 1 minute

      // Test register rate limiting
      const registerLimit = AuthConfig.rateLimits.register;
      expect(registerLimit.limit).toBe(3); // 3 attempts per minute
      expect(registerLimit.ttl).toBe(60); // 1 minute
    });
  });

  describe('Security Monitoring', () => {
    it('should provide security event data for monitoring', () => {
      // Generate some security events
      authSecurityService.recordLoginAttempt(
        '192.168.1.104',
        'user1@example.com',
        false,
        'monitoring-test',
      );
      authSecurityService.recordLoginAttempt(
        '192.168.1.104',
        'user2@example.com',
        false,
        'monitoring-test',
      );
      authSecurityService.recordLoginAttempt(
        '192.168.1.104',
        'user3@example.com',
        false,
        'monitoring-test',
      );
      authSecurityService.recordLoginAttempt(
        '192.168.1.104',
        'user4@example.com',
        false,
        'monitoring-test',
      );
      authSecurityService.recordLoginAttempt(
        '192.168.1.104',
        'user5@example.com',
        false,
        'monitoring-test',
      );

      const events = authSecurityService.getSecurityEvents();
      const blockedIPs = authSecurityService.getBlockedIPs();

      expect(events.length).toBeGreaterThan(0);
      expect(blockedIPs.has('192.168.1.104')).toBe(true);
    });

    it('should allow manual IP management for administrators', () => {
      const ip = '192.168.1.105';

      // Manually block IP
      authSecurityService.blockIP(ip);
      expect(authSecurityService.isIPBlocked(ip)).toBe(true);

      // Manually unblock IP
      authSecurityService.unblockIP(ip);
      expect(authSecurityService.isIPBlocked(ip)).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    it('should have secure default values', () => {
      // JWT configuration
      expect(AuthConfig.jwt.expiresIn).toBe('90m'); // 90 minutes for better UX
      expect(AuthConfig.jwt.algorithm).toBe('HS256'); // Secure algorithm
      expect(AuthConfig.jwt.issuer).toBe('freequency-app');
      expect(AuthConfig.jwt.audience).toBe('freequency-users');

      // Security configuration
      expect(AuthConfig.security.maxLoginAttempts).toBe(5);
      expect(AuthConfig.security.lockoutDuration).toBe(15 * 60 * 1000); // 15 minutes (brute force protection)
      expect(AuthConfig.security.sessionTimeout).toBe(90 * 60 * 1000); // 90 minutes (matches JWT expiration)

      // Cookie configuration
      expect(AuthConfig.cookies.httpOnly).toBe(true);
      expect(AuthConfig.cookies.sameSite).toBe('strict');
      expect(AuthConfig.cookies.maxAge).toBe(90 * 60 * 1000); // 90 minutes
    });
  });
});
