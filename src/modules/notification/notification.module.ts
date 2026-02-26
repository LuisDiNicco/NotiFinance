import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventConsumer } from './infrastructure/primary-adapters/message-brokers/consumers/EventConsumer';
import { DispatcherService } from './application/services/DispatcherService';
import { NotificationService } from './application/services/NotificationService';
import { NOTIFICATION_REPOSITORY } from './application/services/INotificationRepository';
import { EmailChannelAdapter } from './infrastructure/secondary-adapters/workers/EmailChannelAdapter';
import { InAppChannelAdapter } from './infrastructure/secondary-adapters/workers/InAppChannelAdapter';
import { CHANNEL_PROVIDERS } from './application/services/IChannelProvider';
import { PreferencesModule } from '../preferences/preferences.module';
import { TemplateModule } from '../template/template.module';
import { NotificationGateway } from './infrastructure/secondary-adapters/websockets/NotificationGateway';
import { NotificationEntity } from './infrastructure/secondary-adapters/database/entities/NotificationEntity';
import { TypeOrmNotificationRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmNotificationRepository';
import { NotificationController } from './infrastructure/primary-adapters/http/controllers/NotificationController';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    PreferencesModule,
    TemplateModule,
  ],
  controllers: [EventConsumer, NotificationController],
  providers: [
    DispatcherService,
    NotificationService,
    NotificationGateway,
    EmailChannelAdapter,
    InAppChannelAdapter,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: TypeOrmNotificationRepository,
    },
    {
      provide: CHANNEL_PROVIDERS,
      useFactory: (email: EmailChannelAdapter, inApp: InAppChannelAdapter) => [
        email,
        inApp,
      ],
      inject: [EmailChannelAdapter, InAppChannelAdapter],
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
