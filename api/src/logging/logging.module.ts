import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { config } from 'dotenv';

// Load environment variables before module initialization
config();
config({ path: '.env.local' });

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            // Console transport with pretty formatting for development
            {
              target: 'pino-pretty',
              level: 'info',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            },
            // File transport for production
            ...(process.env.DEBUG !== 'TRUE'
              ? [
                  {
                    target: 'pino/file',
                    level: 'info',
                    options: {
                      destination: './logs/app.log',
                      mkdir: true,
                    },
                  },
                ]
              : []),
          ],
        },
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
  ],
  exports: [LoggerModule],
})
export class LoggingModule {}
