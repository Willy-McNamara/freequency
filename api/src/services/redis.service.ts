import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    const redisConfig = {
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: parseInt(this.configService.get('REDIS_PORT')) || 6379,
      password: this.configService.get('REDIS_PASSWORD'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    };

    this.client = createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            this.logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: redisConfig.password,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis Client Connected');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis Client Ready');
    });

    this.client.on('end', () => {
      this.logger.log('Redis Client Disconnected');
    });
  }

  async onModuleInit() {
    try {
      console.log('🔄 [DEBUG] Attempting to connect to Redis...');
      console.log('🔄 [DEBUG] Redis config:', {
        host: this.configService.get('REDIS_HOST') || 'localhost',
        port: this.configService.get('REDIS_PORT') || 6379,
        hasPassword: !!this.configService.get('REDIS_PASSWORD'),
      });

      await this.client.connect();
      console.log('✅ [DEBUG] Redis connection established successfully');

      // Test the connection
      const pingResult = await this.client.ping();
      console.log('✅ [DEBUG] Redis ping result:', pingResult);

      this.logger.log('Redis connection established');
    } catch (error) {
      console.error('❌ [DEBUG] Failed to connect to Redis:', error);
      this.logger.error('Failed to connect to Redis:', error);
      // Don't throw - allow app to continue without Redis
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    } catch (error) {
      this.logger.error('Error closing Redis connection:', error);
    }
  }

  // CSRF Token Methods
  async setCSRFToken(
    userId: number,
    token: string,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    try {
      const key = `csrf:${userId}:${token}`;
      await this.client.setEx(key, ttlSeconds, 'valid');
      this.logger.debug(
        `CSRF token stored for user ${userId}, expires in ${ttlSeconds}s`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to store CSRF token for user ${userId}:`,
        error,
      );
      throw new Error('Failed to store CSRF token');
    }
  }

  async validateCSRFToken(userId: number, token: string): Promise<boolean> {
    try {
      const key = `csrf:${userId}:${token}`;
      const exists = await this.client.exists(key);

      if (exists) {
        // Token is valid - don't delete it (allow reuse within session)
        this.logger.debug(`CSRF token validated for user ${userId}`);
        return true;
      }

      this.logger.warn(`Invalid CSRF token for user ${userId}`);
      return false;
    } catch (error) {
      this.logger.error(
        `Failed to validate CSRF token for user ${userId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Get remaining TTL for a CSRF token
   */
  async getCSRFTokenTTL(userId: number, token: string): Promise<number> {
    try {
      const key = `csrf:${userId}:${token}`;
      const ttl = await this.client.ttl(key);
      return ttl; // Returns -1 if key doesn't exist, -2 if key doesn't exist, or seconds remaining
    } catch (error) {
      this.logger.error(
        `Failed to get TTL for CSRF token for user ${userId}:`,
        error,
      );
      return -2; // Key doesn't exist
    }
  }

  async revokeCSRFToken(userId: number, token: string): Promise<void> {
    try {
      const key = `csrf:${userId}:${token}`;
      await this.client.del(key);
      this.logger.debug(`CSRF token revoked for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to revoke CSRF token for user ${userId}:`,
        error,
      );
    }
  }

  // Generic Redis methods for future caching use
  async get(key: string): Promise<string | null> {
    try {
      const result = await this.client.get(key);
      return typeof result === 'string' ? result : null;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      throw new Error('Failed to set value in Redis');
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error);
      return false;
    }
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }
}
