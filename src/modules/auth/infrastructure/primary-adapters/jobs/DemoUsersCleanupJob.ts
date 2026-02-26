import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../application/IUserRepository';

@Injectable()
export class DemoUsersCleanupJob {
  private readonly logger = new Logger(DemoUsersCleanupJob.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  @Cron('0 4 * * *')
  public async cleanupExpiredDemoUsers(): Promise<void> {
    const expirationDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const deleted =
      await this.userRepository.deleteExpiredDemoUsers(expirationDate);

    this.logger.log(`Demo cleanup completed. Deleted demo users: ${deleted}`);
  }
}
