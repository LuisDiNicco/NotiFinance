import { Injectable, Logger } from '@nestjs/common';
import { IChannelProvider } from '../../../application/services/IChannelProvider';
import { NotificationChannel } from '../../../../preferences/domain/enums/NotificationChannel';
import { NotificationGateway } from '../websockets/NotificationGateway';

@Injectable()
export class InAppChannelAdapter implements IChannelProvider {
  public channelType: NotificationChannel = NotificationChannel.IN_APP;
  private readonly logger = new Logger(InAppChannelAdapter.name);

  constructor(private readonly gateway: NotificationGateway) {}

  send(
    userId: string,
    subject: string,
    body: string,
    correlationId: string,
  ): Promise<void> {
    this.logger.log(
      `[Trace: ${correlationId}] Pushing IN_APP notification to User [${userId}] via WebSocket.`,
    );

    this.gateway.emitNotification(userId, subject, body, correlationId);

    this.logger.log(
      `[Trace: ${correlationId}] IN_APP notification pushed to User [${userId}]`,
    );

    return Promise.resolve();
  }
}
