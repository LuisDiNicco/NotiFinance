import { Injectable } from '@nestjs/common';
import { IMarketCache } from '../../../application/IMarketCache';
import { RedisService } from '../../../../../shared/infrastructure/base/redis/redis.service';

@Injectable()
export class RedisMarketCache implements IMarketCache {
  constructor(private readonly redisService: RedisService) {}

  public async get(key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  public async set(
    key: string,
    value: string,
    expireInSeconds: number,
  ): Promise<void> {
    await this.redisService.set(key, value, expireInSeconds);
  }
}
