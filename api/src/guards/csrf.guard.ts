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

  constructor(private readonly csrfService: CSRFService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;

    // Skip CSRF validation for safe HTTP methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    // Skip CSRF validation for excluded paths
    if (this.isExcludedPath(path)) {
      return true;
    }

    // Skip CSRF validation if no user is authenticated (JWT guard will handle auth)
    if (!request.user?.id) {
      return true;
    }

    try {
      const token = this.extractCSRFToken(request);
      if (!token) {
        throw new UnauthorizedException('CSRF token required');
      }

      const isValid = await this.csrfService.validateToken(
        request.user.id,
        token,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid CSRF token');
      }

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error('CSRF validation error:', error);
      throw new UnauthorizedException('CSRF validation failed');
    }
  }

  private isExcludedPath(path: string): boolean {
    const excludedPaths = ['/auth/csrf-token', '/health', '/webhooks/stripe'];
    return excludedPaths.some((excludedPath) => path.startsWith(excludedPath));
  }

  private extractCSRFToken(request: any): string | null {
    // Priority order: X-CSRF-Token header, _csrf form field, _csrf query parameter
    return (
      request.headers['x-csrf-token'] ||
      request.body?._csrf ||
      request.query?._csrf ||
      null
    );
  }
}
