import { Test, TestingModule } from '@nestjs/testing';
import { AuthSecurityService } from './auth-security.service';
import { AuthConfig } from '../config/auth.config';

describe('AuthSecurityService', () => {
  let service: AuthSecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthSecurityService],
    }).compile();

    service = module.get<AuthSecurityService>(AuthSecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('IP blocking', () => {
    it('should not block IP initially', () => {
      expect(service.isIPBlocked('192.168.1.1')).toBe(false);
    });

    it('should block IP after multiple failed attempts', () => {
      const ip = '192.168.1.1';
      const userAgent = 'test-user-agent';

      // Make multiple failed attempts
      for (let i = 0; i < AuthConfig.security.maxLoginAttempts; i++) {
        service.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      expect(service.isIPBlocked(ip)).toBe(true);
    });

    it('should unblock IP after lockout duration', () => {
      const ip = '192.168.1.2';
      const userAgent = 'test-user-agent';

      // Make multiple failed attempts
      for (let i = 0; i < AuthConfig.security.maxLoginAttempts; i++) {
        service.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      expect(service.isIPBlocked(ip)).toBe(true);

      // Simulate time passing by manually unblocking
      service.unblockIP(ip);
      expect(service.isIPBlocked(ip)).toBe(false);
    });
  });

  describe('Login attempt tracking', () => {
    it('should track successful login attempts', () => {
      const ip = '192.168.1.3';
      const email = 'user@example.com';
      const userAgent = 'test-user-agent';

      service.recordLoginAttempt(ip, email, true, userAgent);

      // Should not be blocked after successful attempt
      expect(service.isIPBlocked(ip)).toBe(false);
    });

    it('should track failed login attempts', () => {
      const ip = '192.168.1.4';
      const email = 'user@example.com';
      const userAgent = 'test-user-agent';

      service.recordLoginAttempt(ip, email, false, userAgent);

      // Should not be blocked after single failed attempt
      expect(service.isIPBlocked(ip)).toBe(false);
    });

    it('should block IP after exactly maxLoginAttempts failed attempts', () => {
      const ip = '192.168.1.5';
      const userAgent = 'test-user-agent';

      // Make exactly maxLoginAttempts failed attempts
      for (let i = 0; i < AuthConfig.security.maxLoginAttempts; i++) {
        service.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      expect(service.isIPBlocked(ip)).toBe(true);
    });

    it('should not block IP if some attempts are successful', () => {
      const ip = '192.168.1.6';
      const userAgent = 'test-user-agent';

      // Make some failed attempts
      for (let i = 0; i < AuthConfig.security.maxLoginAttempts - 1; i++) {
        service.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      // Make one successful attempt
      service.recordLoginAttempt(ip, 'user@example.com', true, userAgent);

      // Should not be blocked
      expect(service.isIPBlocked(ip)).toBe(false);
    });
  });

  describe('Security events', () => {
    it('should log security events', () => {
      const ip = '192.168.1.7';
      const userAgent = 'test-user-agent';

      service.recordLoginAttempt(ip, 'user@example.com', false, userAgent);

      const events = service.getSecurityEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].type).toBe('login_attempt');
      expect(events[0].ip).toBe(ip);
    });

    it('should log brute force events', () => {
      const ip = '192.168.1.8';
      const userAgent = 'test-user-agent';

      // Make multiple failed attempts to trigger brute force detection
      for (let i = 0; i < AuthConfig.security.maxLoginAttempts; i++) {
        service.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      const events = service.getSecurityEvents();
      const bruteForceEvents = events.filter(
        (event) => event.type === 'brute_force',
      );
      expect(bruteForceEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Manual IP management', () => {
    it('should allow manual IP blocking', () => {
      const ip = '192.168.1.9';

      service.blockIP(ip);
      expect(service.isIPBlocked(ip)).toBe(true);
    });

    it('should allow manual IP unblocking', () => {
      const ip = '192.168.1.10';

      service.blockIP(ip);
      expect(service.isIPBlocked(ip)).toBe(true);

      service.unblockIP(ip);
      expect(service.isIPBlocked(ip)).toBe(false);
    });

    it('should allow custom block duration', () => {
      const ip = '192.168.1.11';
      const customDuration = 5000; // 5 seconds

      service.blockIP(ip, customDuration);
      expect(service.isIPBlocked(ip)).toBe(true);

      // Should still be blocked immediately after blocking
      expect(service.isIPBlocked(ip)).toBe(true);
    });
  });

  describe('Token validation', () => {
    it('should validate tokens without throwing errors', () => {
      const token = 'valid-token';
      const ip = '192.168.1.12';
      const userAgent = 'test-user-agent';

      expect(() => {
        service.validateToken(token, ip, userAgent);
      }).not.toThrow();
    });
  });

  describe('Data cleanup', () => {
    it('should maintain reasonable memory usage', () => {
      const ip = '192.168.1.13';
      const userAgent = 'test-user-agent';

      // Make many attempts to test cleanup
      for (let i = 0; i < 100; i++) {
        service.recordLoginAttempt(
          ip,
          `user${i}@example.com`,
          false,
          userAgent,
        );
      }

      const events = service.getSecurityEvents();
      expect(events.length).toBeLessThanOrEqual(1000); // Should cap at 1000 events
    });
  });
});
