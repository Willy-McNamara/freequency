export const SecurityConfig = {
  // Rate Limiting
  rateLimits: {
    general: { ttl: 60, limit: 100 },
    auth: { ttl: 60, limit: 10 },
    api: { ttl: 60, limit: 30 },
    upload: { ttl: 60, limit: 20 }, // Stricter for file uploads
  },

  // Security Headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
  },

  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
    ],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': [
      "'self'",
      'https://www.google-analytics.com',
      'https://analytics.google.com',
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  },

  // CORS Configuration
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://demo.freequencyapp.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
  },

  // JWT Configuration
  jwt: {
    expiresIn: '90m',
    refreshExpiresIn: '7d',
    algorithm: 'HS256',
  },

  // File Upload Security
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'video/mp4',
      'video/webm',
    ],
    scanForViruses: true, // Enable when virus scanning is implemented
  },

  // Session Security
  session: {
    secure: true, // Require HTTPS
    httpOnly: true, // Prevent XSS access
    sameSite: 'strict', // CSRF protection
    maxAge: 90 * 60 * 1000, // 90 minutes
  },
};
