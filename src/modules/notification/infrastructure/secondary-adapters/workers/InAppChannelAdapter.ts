import { Injectable, Logger } from '@nestjs/common';
import { IChannelProvider } from '../../../application/services/IChannelProvider';
import { NotificationChannel } from '../../../../preferences/domain/entities/UserPreference';

@Injectable()
export class InAppChannelAdapter implements IChannelProvider {
    public channelType: NotificationChannel = NotificationChannel.IN_APP;
    private readonly logger = new Logger(InAppChannelAdapter.name);

    async send(userId: string, subject: string, body: string, correlationId: string): Promise<void> {
        this.logger.log(`[Trace: ${correlationId}] Pushing IN_APP notification to User [${userId}] via Socket.`);
        this.logger.debug(`[Trace: ${correlationId}] Content: ${subject} | ${body.length} chars`);

        await new Promise((resolve) => setTimeout(resolve, 50));

        this.logger.log(`[Trace: ${correlationId}] IN_APP notification pushed to User [${userId}]`);
    }
}
