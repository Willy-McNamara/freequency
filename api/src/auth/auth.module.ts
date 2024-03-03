import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { MusiciansService } from '../musicians/musicians.service';
import { MusiciansModule } from '../musicians/musicians.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [JwtModule, MusiciansModule, PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthStrategy, MusiciansService],
  exports: [AuthService],
})
export class AuthModule {}
