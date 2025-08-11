import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SecurityConfig } from '../config/security.config';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address as the primary tracker
    return req.ips.length ? req.ips[0] : req.ip;
  }

  protected async getThrottlerOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Apply stricter limits to authentication routes
    if (url.includes('/auth') || url.includes('/login')) {
      return SecurityConfig.rateLimits.auth;
    }

    // Apply moderate limits to API routes
    if (
      url.includes('/api') ||
      url.includes('/sessions') ||
      url.includes('/tasks')
    ) {
      return SecurityConfig.rateLimits.api;
    }

    // Apply stricter limits for file uploads
    if (url.includes('/upload-media')) {
      return SecurityConfig.rateLimits.upload;
    }

    // Apply general limits to other routes
    return SecurityConfig.rateLimits.general;
  }
}
