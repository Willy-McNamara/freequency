import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class SecureJwtGuard extends AuthGuard('jwt') implements CanActivate {
  private readonly logger = new Logger(SecureJwtGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Log authentication attempts for security monitoring
    this.logger.log(
      `Authentication attempt for ${request.method} ${request.path} from ${request.ip}`,
    );

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): any {
    const request = context.switchToHttp().getRequest<Request>();

    if (err || !user) {
      // Log failed authentication attempts
      this.logger.warn(
        `Authentication failed for ${request.method} ${request.path} from ${request.ip}: ${info?.message || err?.message || 'No user'}`,
      );

      // Don't expose internal error details to clients
      throw new UnauthorizedException('Authentication required');
    }

    // Log successful authentication
    this.logger.log(
      `Authentication successful for user ${user.id} (${user.email}) accessing ${request.method} ${request.path}`,
    );

    return user;
  }
}
