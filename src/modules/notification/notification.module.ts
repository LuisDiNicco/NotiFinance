import { Module } from '@nestjs/common';
import { EventConsumer } from './infrastructure/primary-adapters/message-brokers/consumers/EventConsumer';
import { DispatcherService } from './application/services/DispatcherService';
import { EmailChannelAdapter } from './infrastructure/secondary-adapters/workers/EmailChannelAdapter';
import { InAppChannelAdapter } from './infrastructure/secondary-adapters/workers/InAppChannelAdapter';
import { CHANNEL_PROVIDERS } from './application/services/IChannelProvider';
import { PreferencesModule } from '../preferences/preferences.module';
import { TemplateModule } from '../template/template.module';
import { NotificationGateway } from './infrastructure/secondary-adapters/websockets/NotificationGateway';

@Module({
    imports: [PreferencesModule, TemplateModule],
    controllers: [EventConsumer],
    providers: [
        DispatcherService,
        NotificationGateway,
        EmailChannelAdapter,
        InAppChannelAdapter,
        {
            provide: CHANNEL_PROVIDERS,
            useFactory: (email: EmailChannelAdapter, inApp: InAppChannelAdapter) => [email, inApp],
            inject: [EmailChannelAdapter, InAppChannelAdapter],
        },
    ],
})
export class NotificationModule { }
