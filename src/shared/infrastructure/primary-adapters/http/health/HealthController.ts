import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckError,
  HealthCheckResult,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisService } from '../../../base/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeOrmHealthIndicator: TypeOrmHealthIndicator,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.typeOrmHealthIndicator.pingCheck('database'),
      async () => {
        const isRedisUp = await this.redisService.ping();
        if (!isRedisUp) {
          throw new HealthCheckError('Redis check failed', {
            redis: {
              status: 'down',
            },
          });
        }

        return {
          redis: {
            status: 'up',
          },
        };
      },
    ]);
  }
}
