import { Module } from '@nestjs/common';
import { EventConsumer } from './infrastructure/primary-adapters/message-brokers/consumers/EventConsumer';
import { DispatcherService } from './application/services/DispatcherService';
import { EmailChannelAdapter } from './infrastructure/secondary-adapters/workers/EmailChannelAdapter';
import { InAppChannelAdapter } from './infrastructure/secondary-adapters/workers/InAppChannelAdapter';
import { CHANNEL_PROVIDERS } from './application/services/IChannelProvider';
import { TemplateModule } from '../template/template.module';
import { PreferencesModule } from '../preferences/preferences.module';

@Module({
    imports: [TemplateModule, PreferencesModule],
    controllers: [EventConsumer],
    providers: [
        DispatcherService,
        {
            provide: CHANNEL_PROVIDERS,
            useFactory: (emailAdapter: EmailChannelAdapter, inAppAdapter: InAppChannelAdapter) => {
                return [emailAdapter, inAppAdapter];
            },
            inject: [EmailChannelAdapter, InAppChannelAdapter],
        },
        EmailChannelAdapter,
        InAppChannelAdapter,
    ],
})
export class NotificationModule { }
