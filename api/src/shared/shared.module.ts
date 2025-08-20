import { Module } from '@nestjs/common';
import { RedisService } from '../services/redis.service';
import { CSRFService } from '../services/csrf.service';

@Module({
  providers: [RedisService, CSRFService],
  exports: [RedisService, CSRFService],
})
export class SharedModule {}
