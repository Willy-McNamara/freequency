import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Use IP address as the primary tracker
    return req.ips.length ? req.ips[0] : req.ip;
  }

  protected async getThrottlerOptions(context: ExecutionContext) {
    const { route } = context.getHandler();
    const request = context.switchToHttp().getRequest();

    // Apply stricter limits to authentication routes
    if (route.includes('/auth') || route.includes('/login')) {
      return { ttl: 60, limit: 10, name: 'auth' };
    }

    // Apply moderate limits to API routes
    if (
      route.includes('/api') ||
      route.includes('/sessions') ||
      route.includes('/tasks')
    ) {
      return { ttl: 60, limit: 30, name: 'api' };
    }

    // Apply general limits to other routes
    return { ttl: 60, limit: 100, name: 'general' };
  }
}
