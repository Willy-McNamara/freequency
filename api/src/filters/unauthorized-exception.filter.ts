import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

// add logging

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log('UnauthorizedExceptionFilter hit!');

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
