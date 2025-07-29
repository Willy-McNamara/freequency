import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private prisma: PrismaService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
  ): any {
    // In debug mode, return a mock user object regardless of JWT validation
    if (process.env.DEBUG === 'TRUE') {
      return { id: 96, email: 'dev@example.com', displayName: 'Dev User' };
    }

    if (err || !user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
