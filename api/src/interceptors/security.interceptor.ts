import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Sanitize request body
    if (request.body) {
      this.sanitizeObject(request.body);
    }

    // Sanitize query parameters
    if (request.query) {
      this.sanitizeObject(request.query);
    }

    // Sanitize URL parameters
    if (request.params) {
      this.sanitizeObject(request.params);
    }

    return next.handle().pipe(
      tap(() => {
        // Log security-relevant events
        this.logSecurityEvent(request);
      }),
    );
  }

  private sanitizeObject(obj: any): void {
    if (!obj || typeof obj !== 'object') return;

    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters and patterns
        obj[key] = this.sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        this.sanitizeObject(obj[key]);
      }
    });
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') return str;

    // Remove null bytes
    str = str.replace(/\0/g, '');

    // Remove control characters (except newlines and tabs)
    str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Focus on actual malicious patterns, not just keywords
    const maliciousPatterns = [
      // Actual SQL injection attempts with UNION SELECT
      {
        pattern: /(\bunion\s+select\b)/gi,
        message: 'Content contains potentially unsafe SQL patterns',
      },
      // SQL injection with stacked queries and semicolons
      {
        pattern:
          /(\b(select|insert|update|delete|drop|create|alter|exec|execute)\b\s+[^;]*;\s*\b(select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
        message: 'Content contains potentially unsafe SQL patterns',
      },
      // SQL injection with comment syntax
      {
        pattern:
          /(\b(select|insert|update|delete|drop|create|alter|exec|execute)\b\s+[^;]*--)/gi,
        message: 'Content contains potentially unsafe SQL patterns',
      },
      // SQL injection with MySQL comment syntax
      {
        pattern:
          /(\b(select|insert|update|delete|drop|create|alter|exec|execute)\b\s+[^;]*\/\*)/gi,
        message: 'Content contains potentially unsafe SQL patterns',
      },
      // XSS with script tags
      {
        pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        message: 'Content contains potentially unsafe HTML elements',
      },
      // XSS with javascript: URLs
      {
        pattern: /javascript:/gi,
        message: 'Content contains potentially unsafe URLs',
      },
      // XSS with event handlers (only actual event handlers, not CSS pseudo-selectors)
      {
        pattern: /on\w+\s*=\s*["'][^"']*["']/gi,
        message: 'Content contains potentially unsafe HTML attributes',
      },
      // XSS with iframe tags
      {
        pattern: /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        message: 'Content contains potentially unsafe HTML elements',
      },
    ];

    for (const { pattern, message } of maliciousPatterns) {
      if (pattern.test(str)) {
        throw new BadRequestException(message);
      }
    }

    return str;
  }

  private logSecurityEvent(request: any): void {
    // Log potentially suspicious requests
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal
      /<script/i, // Script tags
      /javascript:/i, // JavaScript protocol
      /union\s+select/i, // SQL injection
      /eval\s*\(/i, // eval function
    ];

    const url = request.url;
    const userAgent = request.headers['user-agent'] || '';
    const ip = request.ip || request.connection?.remoteAddress;

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(userAgent)) {
        console.warn(`[SECURITY] Suspicious request detected:`, {
          url,
          userAgent,
          ip,
          timestamp: new Date().toISOString(),
        });
        break;
      }
    }
  }
}
