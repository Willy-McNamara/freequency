import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  validateUser(username: string, password: string): any {
    // look up user in db
  }

  async login(profile: any) {
    // grab the userID by using the email address from google...

    const dummyUser = {
      userId: '1',
    };
    const payload = { username: profile.username, sub: profile.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
