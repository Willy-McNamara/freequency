import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google.guard';

@Controller('auth')
export class AuthController {
  @Get('login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    console.log('google login route hit');
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(Request) {
    console.log('google login callback route hit. here is req');
    return 'google login callback route hit';
  }
}
