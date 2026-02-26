import { Injectable, Logger } from '@nestjs/common';
import {
  IChannelProvider,
  NotificationDispatchPayload,
} from '../../../application/services/IChannelProvider';
import { NotificationChannel } from '../../../../preferences/domain/enums/NotificationChannel';

@Injectable()
export class EmailChannelAdapter implements IChannelProvider {
  public channelType: NotificationChannel = NotificationChannel.EMAIL;
  private readonly logger = new Logger(EmailChannelAdapter.name);
  private readonly maxAttempts = 3;

  async send(
    userId: string,
    payload: NotificationDispatchPayload,
    correlationId: string,
  ): Promise<void> {
    this.logger.log(
      `[Trace: ${correlationId}] Sending EMAIL to User [${userId}]`,
    );
    this.logger.debug(
      `[Trace: ${correlationId}] Subject: ${payload.title} | Body length: ${payload.body.length}`,
    );

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        await this.sendToProvider(
          userId,
          payload.title,
          payload.body,
          correlationId,
          attempt,
        );
        this.logger.log(
          `[Trace: ${correlationId}] EMAIL successfully dispatched for User [${userId}]`,
        );
        return;
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error('Unknown EMAIL provider error');
        this.logger.warn(
          `[Trace: ${correlationId}] EMAIL attempt ${attempt}/${this.maxAttempts} failed for User [${userId}]: ${lastError.message}`,
        );

        if (attempt < this.maxAttempts) {
          const backoffMs = 200 * 2 ** (attempt - 1);
          await this.wait(backoffMs);
        }
      }
    }

    throw lastError || new Error('EMAIL provider failed after retries');
  }

  private async sendToProvider(
    userId: string,
    _subject: string,
    _body: string,
    correlationId: string,
    attempt: number,
  ): Promise<void> {
    this.logger.debug(
      `[Trace: ${correlationId}] EMAIL provider attempt ${attempt} for User [${userId}]`,
    );

    await this.wait(300);
  }

  private async wait(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
