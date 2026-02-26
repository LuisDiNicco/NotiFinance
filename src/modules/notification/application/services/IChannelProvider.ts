import { NotificationChannel } from '../../../preferences/domain/enums/NotificationChannel';

export interface NotificationDispatchPayload {
  id: string;
  title: string;
  body: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface IChannelProvider {
  channelType: NotificationChannel;
  send(
    userId: string,
    payload: NotificationDispatchPayload,
    correlationId: string,
  ): Promise<void>;
}

export const CHANNEL_PROVIDERS = 'CHANNEL_PROVIDERS';
