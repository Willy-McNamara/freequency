import { Controller, Get, Logger, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from './google.guard';
import { JwtAuthGuard } from './jwt.guard';
import { MusiciansService } from '../musicians/musicians.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly musiciansService: MusiciansService,
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  @Get('login')
  async googleLogin(@Req() req: any, @Res() res: any) {
    console.log('node env', process.env.NODE_ENV);
    console.log('debug', process.env.DEBUG);
    // In development, check for a debug header or parameter
    if (
      (process.env.NODE_ENV === 'development' ||
        process.env.DEBUG === 'TRUE') &&
      req.query.debug === 'true'
    ) {
      // Auto-authenticate for development - just ensure dev user exists
      let devUser = await this.prisma.musician.findFirst({
        where: { email: 'dev@example.com' },
      });

      console.log('Debug: Found existing dev user:', devUser);

      if (!devUser) {
        devUser = await this.prisma.musician.create({
          data: {
            email: 'dev@example.com',
            displayName: 'Dev User',
            givenName: 'Dev',
            familyName: 'User',
            googleId: 'dev-google-id',
          },
        });
        console.log('Debug: Created new dev user:', devUser);
      }

      console.log(
        'Debug: Redirecting to frontend (no JWT needed in debug mode)',
      );

      // In debug mode, redirect back to the frontend dev server
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(frontendUrl);
      return;
    }

    // Normal Google OAuth flow - apply guard here
    // Logger.log('google login route hit');
    // For normal flow, we need to redirect to Google OAuth
    // This would normally be handled by the GoogleAuthGuard
    // Redirect to Google OAuth for normal flow
    res.redirect('/auth/google');
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleOAuth() {
    // This will be handled by the GoogleAuthGuard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const user = req.user; // this is the return of GoogleAuthStrategy.validate()

    res.cookie('jwt', user.token, { httpOnly: true, secure: true });

    // In debug mode, redirect to frontend dev server
    if (process.env.DEBUG === 'TRUE') {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(frontendUrl);
    } else {
      res.redirect(process.env.BACKEND_URL);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any) {
    console.log('Auth me called with user:', req.user);

    const musicianData = await this.musiciansService.getMusicianById(
      req.user.id,
    );
    console.log('Musician data found:', musicianData);

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

  // Debug endpoint for development
  @Get('debug-login')
  async debugLogin(@Res() res: any) {
    try {
      // Find or create a dev user
      let devUser = await this.prisma.musician.findFirst({
        where: { email: 'dev@example.com' },
      });

      if (!devUser) {
        // Create a dev user if it doesn't exist
        devUser = await this.prisma.musician.create({
          data: {
            email: 'dev@example.com',
            displayName: 'Dev User',
            givenName: 'Dev',
            familyName: 'User',
            googleId: 'dev-google-id',
          },
        });
      }

      // Create a debug JWT token
      const token = await this.authService.createDebugToken(
        devUser.id,
        devUser.email,
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: false, // secure: false for localhost
        sameSite: 'lax',
      });

      res.redirect('/');
    } catch (error) {
      console.error('Debug login error:', error);
      res.status(500).json({ error: 'Debug login failed' });
    }
  }
}
