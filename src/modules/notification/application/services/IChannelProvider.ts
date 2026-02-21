import { NotificationChannel } from '../../../preferences/domain/entities/UserPreference';

export interface IChannelProvider {
    channelType: NotificationChannel;
    send(userId: string, subject: string, body: string, correlationId: string): Promise<void>;
}

export const CHANNEL_PROVIDERS = 'CHANNEL_PROVIDERS';
