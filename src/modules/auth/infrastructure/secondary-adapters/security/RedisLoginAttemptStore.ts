import { Injectable } from '@nestjs/common';
import {
  ILoginAttemptStore,
  LOGIN_ATTEMPT_STORE,
} from '../../../application/ILoginAttemptStore';
import { RedisService } from '../../../../../shared/infrastructure/base/redis/redis.service';

@Injectable()
export class RedisLoginAttemptStore implements ILoginAttemptStore {
  constructor(private readonly redisService: RedisService) {}

  public async isLoginLocked(email: string): Promise<boolean> {
    const lock = await this.redisService.get(this.getLockKey(email));
    return lock === '1';
  }

  public async registerFailedAttempt(params: {
    email: string;
    lockoutSeconds: number;
    maxFailedLoginAttempts: number;
  }): Promise<void> {
    const attempts = await this.redisService.increment(
      this.getFailedAttemptsKey(params.email),
      params.lockoutSeconds,
    );

    if (attempts >= params.maxFailedLoginAttempts) {
      await this.redisService.set(
        this.getLockKey(params.email),
        '1',
        params.lockoutSeconds,
      );
      await this.redisService.delete(this.getFailedAttemptsKey(params.email));
    }
  }

  public async clearFailedLoginState(email: string): Promise<void> {
    await this.redisService.delete(this.getFailedAttemptsKey(email));
    await this.redisService.delete(this.getLockKey(email));
  }

  private getFailedAttemptsKey(email: string): string {
    return `auth:login:attempts:${email}`;
  }

  private getLockKey(email: string): string {
    return `auth:login:locked:${email}`;
  }
}

export { LOGIN_ATTEMPT_STORE };
