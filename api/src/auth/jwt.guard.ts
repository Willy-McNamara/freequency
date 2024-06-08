import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any): any {
    if (process.env.DEBUG === 'TRUE') {
      Logger.log('DEBUG MODE: jwt.guard.ts handleRequest');
      return { id: 4 };
    }
    if (err || !user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
