export const AuthConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '90m', // 90 minutes for better UX
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256',
    issuer: process.env.JWT_ISSUER || 'freequency-app',
    audience: process.env.JWT_AUDIENCE || 'freequency-users',
  },

  // Cookie Configuration
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 90 * 60 * 1000, // 90 minutes in milliseconds
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  },

  // OAuth Configuration
  oauth: {
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
    },
  },

  // Security Settings
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes (keep this for brute force)
    passwordMinLength: 8,
    requireMFA: process.env.REQUIRE_MFA === 'true',
    sessionTimeout: 90 * 60 * 1000, // 90 minutes (matches JWT expiration)
  },

  // Rate Limiting for Auth Endpoints
  rateLimits: {
    login: { ttl: 60, limit: 5 }, // 5 attempts per minute
    register: { ttl: 60, limit: 3 }, // 3 attempts per minute
    passwordReset: { ttl: 300, limit: 3 }, // 3 attempts per 5 minutes
  },
};

// Validation function to ensure required environment variables are set
export function validateAuthConfig(): void {
  const requiredVars = [
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  // Ensure JWT secret is strong enough
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}
