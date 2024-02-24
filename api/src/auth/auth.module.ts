import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleAuthStrategy } from './google.strategy';
import { PassportStrategy } from '@nestjs/passport';
import { GoogleStrategy } from 'passport-google-oauth20';

@Module({
  // imports: [PassportStrategy, GoogleStrategy],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthStrategy],
})
export class AuthModule {}
