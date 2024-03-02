import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtService: JwtService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log(
      'validate func from googleAuthStrategy',
      profile.id,
      profile.email,
      profile.name,
      accessToken,
    );
    const jwtPayload = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
    };

    const jwtToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '30m',
      secret: process.env.JWT_SECRET,
    });

    console.log(
      'validate fun hit for googleAuthStrategy -==-===========================-==-===========================',
    );
    /*
    here is where I can access the user's google profile, and where I believe I should be creating a JWT to track attach to the users subsequent traffic.

    */
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      token: jwtToken,
    };
  }
}
