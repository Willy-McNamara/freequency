import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google.guard';

@Controller('auth')
export class AuthController {
  @Get('login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {
    // Logger.log('google login route hit');
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const user = req.user; // this is the return of GoogleAuthStrategy.validate()

    res.cookie('jwt', user.token, { httpOnly: true, secure: true });

    res.redirect(process.env.BACKEND_URL);
  }
}
