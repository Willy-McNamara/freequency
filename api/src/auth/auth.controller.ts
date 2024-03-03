import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const user = req.user; // this is the return of GoogleAuthStrategy.validate()

    console.log('logging req.user in googleLoginCallback', req.user);

    res.cookie('jwt', user.token, { httpOnly: true, secure: true });

    res.redirect('http://localhost:3000/');
  }
}
