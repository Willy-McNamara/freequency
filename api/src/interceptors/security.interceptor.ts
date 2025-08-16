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

    // Basic SQL injection prevention (basic level - validation pipe handles more)
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
      /(\b(or|and)\b\s+\d+\s*[=<>])/gi,
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script)\b)/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(str)) {
        throw new BadRequestException('Invalid input detected');
      }
    }

    // Basic XSS prevention
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(str)) {
        throw new BadRequestException('Invalid input detected');
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
