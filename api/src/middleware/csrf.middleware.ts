import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CSRFService } from '../services/csrf.service';

@Injectable()
export class CSRFMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CSRFMiddleware.name);
  private readonly stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  constructor(private readonly csrfService: CSRFService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only validate CSRF tokens for state-changing methods
    if (!this.stateChangingMethods.includes(req.method)) {
      console.log(
        `🔄 [DEBUG] CSRF: Skipping ${req.method} ${req.path} (not state-changing)`,
      );
      return next();
    }

    // Skip CSRF validation for certain endpoints (if needed)
    if (this.shouldSkipCSRFValidation(req.path)) {
      console.log(
        `🔄 [DEBUG] CSRF: Skipping ${req.method} ${req.path} (excluded path)`,
      );
      return next();
    }

    console.log(`🔄 [DEBUG] CSRF: Validating ${req.method} ${req.path}`);

    try {
      // Extract user ID from JWT (assuming it's been decoded by JWT guard)
      const userId = (req as any).user?.id;

      if (!userId) {
        console.log('❌ [DEBUG] CSRF: No user ID found in request');
        this.logger.warn('CSRF validation failed: No user ID found');
        throw new UnauthorizedException('User not authenticated');
      }

      console.log(`🔄 [DEBUG] CSRF: Validating for user ${userId}`);

      // Extract CSRF token from request
      const csrfToken = this.extractCSRFToken(req);

      if (!csrfToken) {
        console.log(`❌ [DEBUG] CSRF: No token found for user ${userId}`);
        this.logger.warn(
          `CSRF validation failed: No token found for user ${userId}`,
        );
        throw new UnauthorizedException('CSRF token required');
      }

      console.log(
        `🔄 [DEBUG] CSRF: Token found: ${csrfToken.substring(0, 8)}...`,
      );

      // Validate the CSRF token
      const isValid = await this.csrfService.validateToken(userId, csrfToken);

      if (!isValid) {
        console.log(`❌ [DEBUG] CSRF: Invalid token for user ${userId}`);
        this.logger.warn(
          `CSRF validation failed: Invalid token for user ${userId}`,
        );
        throw new UnauthorizedException('Invalid CSRF token');
      }

      console.log(`✅ [DEBUG] CSRF: Validation successful for user ${userId}`);
      this.logger.debug(`CSRF validation successful for user ${userId}`);
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('❌ [DEBUG] CSRF: Validation error:', error);
      this.logger.error('CSRF validation error:', error);
      throw new UnauthorizedException('CSRF validation failed');
    }
  }

  /**
   * Extract CSRF token from request
   * Priority: 1. X-CSRF-Token header, 2. _csrf form field, 3. _csrf query param
   */
  private extractCSRFToken(req: Request): string | null {
    // Check X-CSRF-Token header (preferred method)
    const headerToken = req.headers['x-csrf-token'] as string;
    if (headerToken) {
      return headerToken;
    }

    // Check _csrf form field
    const formToken = (req.body as any)?._csrf;
    if (formToken) {
      return formToken;
    }

    // Check _csrf query parameter
    const queryToken = req.query._csrf as string;
    if (queryToken) {
      return queryToken;
    }

    return null;
  }

  /**
   * Determine if CSRF validation should be skipped for a given path
   */
  private shouldSkipCSRFValidation(path: string): boolean {
    // Skip CSRF validation for certain endpoints
    const skipPaths = [
      '/auth/csrf-token', // CSRF token endpoint itself
      '/health', // Health checks
      '/webhooks', // Webhook endpoints (if any)
    ];

    return skipPaths.some((skipPath) => path.startsWith(skipPath));
  }
}
