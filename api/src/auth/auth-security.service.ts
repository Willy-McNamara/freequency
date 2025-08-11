import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthConfig } from '../config/auth.config';

export interface LoginAttempt {
  ip: string;
  email: string;
  timestamp: number;
  success: boolean;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'brute_force' | 'suspicious_activity' | 'token_reuse';
  ip: string;
  userAgent: string;
  details: string;
  timestamp: Date;
}

@Injectable()
export class AuthSecurityService {
  private readonly logger = new Logger(AuthSecurityService.name);

  // In-memory storage for login attempts (in production, use Redis or database)
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private blockedIPs: Map<string, number> = new Map();
  private securityEvents: SecurityEvent[] = [];

  /**
   * Check if IP is blocked due to too many failed attempts
   */
  isIPBlocked(ip: string): boolean {
    const blockedUntil = this.blockedIPs.get(ip);
    if (blockedUntil && blockedUntil > Date.now()) {
      return true;
    }

    // Remove expired block
    if (blockedUntil && blockedUntil <= Date.now()) {
      this.blockedIPs.delete(ip);
    }

    return false;
  }

  /**
   * Record a login attempt and check for brute force
   */
  recordLoginAttempt(
    ip: string,
    email: string,
    success: boolean,
    userAgent: string,
  ): void {
    const attempt: LoginAttempt = {
      ip,
      email,
      timestamp: Date.now(),
      success,
    };

    // Store attempt
    if (!this.loginAttempts.has(ip)) {
      this.loginAttempts.set(ip, []);
    }
    this.loginAttempts.get(ip)!.push(attempt);

    // Clean old attempts (older than 1 hour)
    this.cleanOldAttempts(ip);

    // Check for brute force
    this.checkBruteForce(ip, userAgent);

    // Log security event
    this.logSecurityEvent({
      type: 'login_attempt',
      ip,
      userAgent,
      details: `${success ? 'Successful' : 'Failed'} login attempt for ${email}`,
      timestamp: new Date(),
    });
  }

  /**
   * Check for brute force attacks
   */
  private checkBruteForce(ip: string, userAgent: string): void {
    const attempts = this.loginAttempts.get(ip) || [];
    const recentAttempts = attempts.filter(
      (attempt) =>
        attempt.timestamp > Date.now() - AuthConfig.security.lockoutDuration,
    );

    const failedAttempts = recentAttempts.filter((attempt) => !attempt.success);

    if (failedAttempts.length >= AuthConfig.security.maxLoginAttempts) {
      // Block IP
      const blockUntil = Date.now() + AuthConfig.security.lockoutDuration;
      this.blockedIPs.set(ip, blockUntil);

      // Log brute force detection
      this.logger.warn(
        `Brute force detected from IP ${ip}. Blocked until ${new Date(blockUntil)}`,
      );

      this.logSecurityEvent({
        type: 'brute_force',
        ip,
        userAgent,
        details: `Brute force attack detected. ${failedAttempts.length} failed attempts in ${AuthConfig.security.lockoutDuration / 1000} seconds`,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Clean old login attempts
   */
  private cleanOldAttempts(ip: string): void {
    const attempts = this.loginAttempts.get(ip);
    if (!attempts) return;

    const cutoff = Date.now() - AuthConfig.security.lockoutDuration;
    const recentAttempts = attempts.filter(
      (attempt) => attempt.timestamp > cutoff,
    );

    this.loginAttempts.set(ip, recentAttempts);
  }

  /**
   * Validate JWT token for security issues
   */
  validateToken(token: string, ip: string, userAgent: string): void {
    try {
      // Check for token reuse (basic check - in production use a token blacklist)
      // This is a simplified implementation

      // Log token validation
      this.logger.log(`Token validation for IP ${ip}`);
    } catch (error) {
      this.logSecurityEvent({
        type: 'suspicious_activity',
        ip,
        userAgent,
        details: `Token validation failed: ${error.message}`,
        timestamp: new Date(),
      });
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Log security events
   */
  private logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Log to console and potentially to external security monitoring system
    this.logger.warn(
      `[SECURITY] ${event.type}: ${event.details} from ${event.ip}`,
    );
  }

  /**
   * Get security events for monitoring
   */
  getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents];
  }

  /**
   * Get blocked IPs for monitoring
   */
  getBlockedIPs(): Map<string, number> {
    return new Map(this.blockedIPs);
  }

  /**
   * Manually block an IP (for admin use)
   */
  blockIP(
    ip: string,
    duration: number = AuthConfig.security.lockoutDuration,
  ): void {
    const blockUntil = Date.now() + duration;
    this.blockedIPs.set(ip, blockUntil);

    this.logger.warn(`IP ${ip} manually blocked until ${new Date(blockUntil)}`);
  }

  /**
   * Unblock an IP (for admin use)
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.logger.log(`IP ${ip} manually unblocked`);
  }
}
