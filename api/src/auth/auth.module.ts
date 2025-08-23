import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { MusiciansService } from '../musicians/musicians.service';
import { MusiciansModule } from '../musicians/musicians.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    SharedModule, // Import shared module for Redis and CSRF services
    MusiciansModule,
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleAuthStrategy,
    JwtStrategy,
    MusiciansService,
    PrismaService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
