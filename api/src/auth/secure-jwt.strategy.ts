import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../config/auth.config';

@Injectable()
export class SecureJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extract from cookies first (for web clients)
        (request: any) => {
          return request?.cookies?.jwt;
        },
        // Extract from Authorization header (for mobile/API clients)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: AuthConfig.jwt.secret,
      issuer: AuthConfig.jwt.issuer,
      audience: AuthConfig.jwt.audience,
      algorithms: [AuthConfig.jwt.algorithm],
      // Additional security options
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: any) {
    // Validate payload structure
    if (!payload.id || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Validate token type (if you implement different token types)
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if token is expired (should be handled by passport, but double-check)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Token expired');
    }

    // Check if token was issued in the future (clock skew protection)
    if (payload.iat && payload.iat > now + 60) {
      // Allow 1 minute clock skew
      throw new UnauthorizedException('Token issued in the future');
    }

    // Return user object with minimal required data
    return {
      id: payload.id,
      email: payload.email,
      displayName: payload.displayName,
      // Add token metadata for security logging
      tokenId: payload.jti, // JWT ID if available
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  }
}
