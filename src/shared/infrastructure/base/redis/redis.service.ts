import { Injectable, Inject } from '@nestjs/common';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class RedisService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType<any, any, any>,
    ) { }

    async setNx(key: string, value: string, expireInSeconds: number): Promise<boolean> {
        const result = await this.redisClient.set(key, value, {
            NX: true,
            EX: expireInSeconds,
        });
        return result === 'OK';
    }
}
