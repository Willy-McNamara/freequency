import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { randomBytes } from 'crypto';

@Injectable()
export class CSRFService {
  private readonly logger = new Logger(CSRFService.name);
  private readonly TOKEN_LENGTH = 32; // 256 bits
  private readonly TOKEN_TTL = 5400; // 90 minutes (matching JWT expiration)

  constructor(private readonly redisService: RedisService) {}

  /**
   * Generate a new CSRF token for a user
   * @param userId - The user's ID
   * @returns The generated CSRF token
   */
  async generateToken(userId: number): Promise<string> {
    try {
      console.log(`🔄 [DEBUG] Generating CSRF token for user ${userId}`);

      // Generate cryptographically secure random token
      const token = randomBytes(this.TOKEN_LENGTH).toString('hex');
      console.log(`✅ [DEBUG] Generated token: ${token.substring(0, 8)}...`);

      // Store token in Redis with TTL
      await this.redisService.setCSRFToken(userId, token, this.TOKEN_TTL);
      console.log(`✅ [DEBUG] Token stored in Redis for user ${userId}`);

      this.logger.debug(`Generated CSRF token for user ${userId}`);
      return token;
    } catch (error) {
      console.error(
        `❌ [DEBUG] Failed to generate CSRF token for user ${userId}:`,
        error,
      );
      this.logger.error(
        `Failed to generate CSRF token for user ${userId}:`,
        error,
      );
      throw new Error('Failed to generate CSRF token');
    }
  }

  /**
   * Validate a CSRF token for a user
   * @param userId - The user's ID
   * @param token - The CSRF token to validate
   * @returns True if token is valid, false otherwise
   */
  async validateToken(userId: number, token: string): Promise<boolean> {
    try {
      if (!token || typeof token !== 'string') {
        this.logger.warn(`Invalid CSRF token format for user ${userId}`);
        return false;
      }

      // Validate token format (should be 64 hex characters)
      if (!/^[a-f0-9]{64}$/.test(token)) {
        this.logger.warn(`CSRF token format invalid for user ${userId}`);
        return false;
      }

      const isValid = await this.redisService.validateCSRFToken(userId, token);

      if (isValid) {
        this.logger.debug(
          `CSRF token validated successfully for user ${userId}`,
        );
      } else {
        this.logger.warn(`CSRF token validation failed for user ${userId}`);
      }

      return isValid;
    } catch (error) {
      this.logger.error(
        `Error validating CSRF token for user ${userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Revoke a CSRF token for a user
   * @param userId - The user's ID
   * @param token - The CSRF token to revoke
   */
  async revokeToken(userId: number, token: string): Promise<void> {
    try {
      await this.redisService.revokeCSRFToken(userId, token);
      this.logger.debug(`CSRF token revoked for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to revoke CSRF token for user ${userId}:`,
        error,
      );
    }
  }

  /**
   * Refresh a CSRF token (generate new one and revoke old)
   * @param userId - The user's ID
   * @param oldToken - The old CSRF token to revoke
   * @returns The new CSRF token
   */
  async refreshToken(userId: number, oldToken?: string): Promise<string> {
    try {
      // Revoke old token if provided
      if (oldToken) {
        await this.revokeToken(userId, oldToken);
      }

      // Generate new token
      const newToken = await this.generateToken(userId);

      this.logger.debug(`CSRF token refreshed for user ${userId}`);
      return newToken;
    } catch (error) {
      this.logger.error(
        `Failed to refresh CSRF token for user ${userId}:`,
        error,
      );
      throw new Error('Failed to refresh CSRF token');
    }
  }

  /**
   * Check if Redis is available for CSRF operations
   * @returns True if Redis is healthy, false otherwise
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.redisService.isHealthy();
    } catch (error) {
      this.logger.error('Failed to check Redis health:', error);
      return false;
    }
  }

  /**
   * Get token TTL in seconds
   * @returns Token TTL in seconds
   */
  getTokenTTL(): number {
    return this.TOKEN_TTL;
  }

  /**
   * Get token length in bytes
   * @returns Token length in bytes
   */
  getTokenLength(): number {
    return this.TOKEN_LENGTH;
  }

  /**
   * Check if a token is about to expire (within 5 minutes)
   * @param userId - The user's ID
   * @param token - The CSRF token to check
   * @returns True if token expires within 5 minutes, false otherwise
   */
  async isTokenExpiringSoon(userId: number, token: string): Promise<boolean> {
    try {
      const ttl = await this.redisService.getCSRFTokenTTL(userId, token);
      // Return true if token expires within 5 minutes (300 seconds)
      return ttl > 0 && ttl <= 300;
    } catch (error) {
      this.logger.error(
        `Failed to check token expiration for user ${userId}:`,
        error,
      );
      return false;
    }
  }
}
