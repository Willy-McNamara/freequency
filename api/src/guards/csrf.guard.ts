import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { CSRFService } from '../services/csrf.service';

@Injectable()
export class CSRFGuard implements CanActivate {
  private readonly logger = new Logger(CSRFGuard.name);
  private readonly stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  constructor(private readonly csrfService: CSRFService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;

    console.log(`🚀 [DEBUG] CSRF: Guard activated for ${method} ${path}`);

    // Only validate CSRF tokens for state-changing methods
    if (!this.stateChangingMethods.includes(method)) {
      console.log(
        `🔄 [DEBUG] CSRF: Skipping ${method} ${path} (not state-changing)`,
      );
      return true;
    }

    // Skip CSRF validation for certain endpoints (if needed)
    if (this.shouldSkipCSRFValidation(path)) {
      console.log(
        `🔄 [DEBUG] CSRF: Skipping ${method} ${path} (excluded path)`,
      );
      return true;
    }

    console.log(`🔄 [DEBUG] CSRF: Validating ${method} ${path}`);

    try {
      // Extract user ID from JWT (now available since this runs after JWT guard)
      const userId = request.user?.id;

      if (!userId) {
        console.log(
          '🔄 [DEBUG] CSRF: No user ID found, skipping CSRF validation (JWT guard will handle auth)',
        );
        // Skip CSRF validation if no user - let JWT guard handle authentication
        return true;
      }

      console.log(`🔄 [DEBUG] CSRF: Validating for user ${userId}`);

      // Extract CSRF token from request
      const csrfToken = this.extractCSRFToken(request);

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
      return true;
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
  private extractCSRFToken(req: any): string | null {
    // Check X-CSRF-Token header (preferred method)
    const headerToken = req.headers['x-csrf-token'] as string;
    if (headerToken) {
      return headerToken;
    }

    // Check _csrf form field
    const formToken = req.body?._csrf;
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
