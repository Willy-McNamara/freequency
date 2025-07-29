import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MusiciansService } from '../musicians/musicians.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private musiciansService: MusiciansService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateUser(username: string, password: string): any {
    // look up user in db
  }

  async login(profile: any) {
    // grab the userID by using the email address from google...

    const payload = { username: profile.username, sub: profile.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createDebugToken(userId: number, email: string) {
    const payload = { id: userId, email: email };
    return this.jwtService.sign(payload);
  }
}
