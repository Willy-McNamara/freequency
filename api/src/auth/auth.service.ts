import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  validateUser(username: string, password: string): any {
    // look up user in db
  }
}
