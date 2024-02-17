import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const requestBody = req.body;
    const queryParams = req.query;

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent}`,
      );

      if (Object.keys(requestBody).length > 0) {
        this.logger.log(`Request Body: ${JSON.stringify(requestBody)}`);
      }

      if (Object.keys(queryParams).length > 0) {
        this.logger.log(`Query Parameters: ${JSON.stringify(queryParams)}`);
      }
    });

    next();
  }
}
