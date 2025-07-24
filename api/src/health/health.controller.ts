import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  // Main health check endpoint
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    // Prisma DB check
    const dbCheck = async (): Promise<HealthIndicatorResult> => {
      try {
        // Simple query to check DB connection
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: 'up' } };
      } catch (e) {
        return { database: { status: 'down', message: e.message } };
      }
    };

    // S3 check
    const s3Check = async (): Promise<HealthIndicatorResult> => {
      try {
        await this.s3Service.checkBucketHealth();
        return { s3: { status: 'up' } };
      } catch (e) {
        return { s3: { status: 'down', message: e.message } };
      }
    };

    return this.health.check([dbCheck, s3Check]);
  }

  // Simple liveness endpoint
  @Get('liveness')
  liveness(): { status: string } {
    return { status: 'ok' };
  }
}
