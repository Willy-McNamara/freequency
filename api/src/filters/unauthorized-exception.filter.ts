import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Error) {
      response
        .status(HttpStatus.UNAUTHORIZED)
        .send('Unauthorized - Redirect to login page');
    } else {
      response
        .status(HttpStatus.UNAUTHORIZED)
        .send('Unauthorized - Redirect to login page');
    }
  }
}
