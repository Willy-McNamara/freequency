import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google.guard';
import { JwtAuthGuard } from './jwt.guard';
import { MusiciansService } from '../musicians/musicians.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly musiciansService: MusiciansService,
    private readonly prisma: PrismaService,
  ) {}

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any) {
    const musicianData = await this.musiciansService.getMusicianById(
      req.user.id,
    );
    if (!musicianData) {
      throw new Error('User not found');
    }

    // Get the full musician data including email
    const fullMusicianData = await this.prisma.musician.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, displayName: true, avatarUrl: true },
    });

    return {
      id: fullMusicianData.id,
      email: fullMusicianData.email,
      name: fullMusicianData.displayName,
      displayName: fullMusicianData.displayName,
      avatarUrl: fullMusicianData.avatarUrl,
    };
  }

  @Get('logout')
  async logout(@Res() res: any) {
    res.clearCookie('jwt');
    res.redirect('/login');
  }
}
