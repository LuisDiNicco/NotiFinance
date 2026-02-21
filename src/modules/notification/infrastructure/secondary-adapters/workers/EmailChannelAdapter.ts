import { Injectable, Logger } from '@nestjs/common';
import { IChannelProvider } from '../../../application/services/IChannelProvider';
import { NotificationChannel } from '../../../../preferences/domain/entities/UserPreference';

@Injectable()
export class EmailChannelAdapter implements IChannelProvider {
    public channelType: NotificationChannel = NotificationChannel.EMAIL;
    private readonly logger = new Logger(EmailChannelAdapter.name);

    async send(userId: string, subject: string, body: string, correlationId: string): Promise<void> {
        this.logger.log(`[Trace: ${correlationId}] Sending EMAIL to User [${userId}]`);
        this.logger.debug(`[Trace: ${correlationId}] Subject: ${subject} | Body length: ${body.length}`);

        // Simulating an external API call like SendGrid
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Simulate a random failure to test Nack logic if needed (disabled for normal testing)
        // if (Math.random() < 0.1) throw new Error('SendGrid Timeout');

        this.logger.log(`[Trace: ${correlationId}] EMAIL successfully dispatched for User [${userId}]`);
    }
}
