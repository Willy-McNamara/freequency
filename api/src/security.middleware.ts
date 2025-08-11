import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityConfig } from './config/security.config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Apply security headers from configuration
    Object.entries(SecurityConfig.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Build Content Security Policy from configuration
    const cspParts = Object.entries(SecurityConfig.csp).map(
      ([directive, sources]) => {
        return `${directive} ${sources.join(' ')}`;
      },
    );
    res.setHeader('Content-Security-Policy', cspParts.join('; '));

    // HTTP Strict Transport Security (HSTS)
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );

    // Remove potentially dangerous headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  }
}
