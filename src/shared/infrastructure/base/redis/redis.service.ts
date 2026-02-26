import { Injectable, Inject } from '@nestjs/common';
import type {
  RedisClientType,
  RedisModules,
  RedisFunctions,
  RedisScripts,
} from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT_TOKEN';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: RedisClientType<
      RedisModules,
      RedisFunctions,
      RedisScripts
    >,
  ) {}

  async setNx(
    key: string,
    value: string,
    expireInSeconds: number,
  ): Promise<boolean> {
    const result = await this.redisClient.set(key, value, {
      NX: true,
      EX: expireInSeconds,
    });
    return result === 'OK';
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(
    key: string,
    value: string,
    expireInSeconds: number,
  ): Promise<void> {
    await this.redisClient.set(key, value, {
      EX: expireInSeconds,
    });
  }

  async increment(key: string, expireInSeconds: number): Promise<number> {
    const value = await this.redisClient.incr(key);

    if (value === 1) {
      await this.redisClient.expire(key, expireInSeconds);
    }

    return value;
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async ping(): Promise<boolean> {
    const result = await this.redisClient.ping();
    return result === 'PONG';
  }
}
