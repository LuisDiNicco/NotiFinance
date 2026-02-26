import { Injectable, Logger } from '@nestjs/common';
import {
  IChannelProvider,
  NotificationDispatchPayload,
} from '../../../application/services/IChannelProvider';
import { NotificationChannel } from '../../../../preferences/domain/enums/NotificationChannel';
import { NotificationGateway } from '../websockets/NotificationGateway';
import { NotificationService } from '../../../application/services/NotificationService';

@Injectable()
export class InAppChannelAdapter implements IChannelProvider {
  public channelType: NotificationChannel = NotificationChannel.IN_APP;
  private readonly logger = new Logger(InAppChannelAdapter.name);

  constructor(
    private readonly gateway: NotificationGateway,
    private readonly notificationService: NotificationService,
  ) {}

  send(
    userId: string,
    payload: NotificationDispatchPayload,
    correlationId: string,
  ): Promise<void> {
    this.logger.log(
      `[Trace: ${correlationId}] Pushing IN_APP notification to User [${userId}] via WebSocket.`,
    );

    this.gateway.emitNotification(userId, payload, correlationId);

    return this.notificationService
      .getUnreadCount(userId)
      .then((unreadCount) => {
        this.gateway.emitNotificationCount(userId, unreadCount, correlationId);
        this.logger.log(
          `[Trace: ${correlationId}] IN_APP notification pushed to User [${userId}]`,
        );
      });
  }
}
