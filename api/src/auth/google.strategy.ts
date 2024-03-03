import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { MusiciansService } from '../musicians/musicians.service';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly jwtService: JwtService,
    private readonly musiciansService: MusiciansService,
  ) {
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
      profile.emails[0].value,
      profile.displayName,
      profile.name.givenName,
      profile.name.familyName,
      accessToken,
    );

    const musicianData = await this.musiciansService.findOrCreateMusician({
      googleId: profile.id,
      displayName: profile.displayName,
      givenName: profile.name.givenName
        ? profile.name.givenName
        : 'noGivenName',
      familyName: profile.name.familyName
        ? profile.name.familyName
        : 'noFamilyName',
      email: profile.emails[0].value,
      profilePictureUrl: profile.photos[0].value
        ? profile.photos[0].value
        : null,
    });
    console.log('logging profile returned from googleAuthStrategy', profile);

    const jwtPayload = {
      id: musicianData.id,
      email: musicianData.email,
      name: musicianData.displayName,
    };

    const jwtToken = this.jwtService.sign(jwtPayload, {
      expiresIn: '5m',
      secret: process.env.JWT_SECRET,
    });

    console.log(
      'validate fun hit for googleAuthStrategy -==-===========================-==-===========================',
    );
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      token: jwtToken,
    };
  }
}
