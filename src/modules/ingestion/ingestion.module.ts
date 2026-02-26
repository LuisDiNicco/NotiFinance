import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventIngestionController } from './infrastructure/primary-adapters/http/controllers/EventIngestionController';
import { EventIngestionService } from './application/EventIngestionService';
import {
  RabbitMQEventPublisher,
  RABBITMQ_SERVICE,
} from './infrastructure/secondary-adapters/message-brokers/publishers/RabbitMQEventPublisher';
import { EVENT_PUBLISHER } from './application/IEventPublisher';
import { RabbitMqTopologyService } from './infrastructure/secondary-adapters/message-brokers/RabbitMqTopologyService';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>('integrations.rabbitmq.url') as string,
            ],
            queue: 'notification-events-queue',
            queueOptions: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': '',
                'x-dead-letter-routing-key': 'notification-events-queue.dlq',
              },
            },
            exchange: 'notifinance.events',
            exchangeType: 'topic',
            wildcards: true,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [EventIngestionController],
  providers: [
    EventIngestionService,
    RabbitMqTopologyService,
    {
      provide: EVENT_PUBLISHER,
      useClass: RabbitMQEventPublisher,
    },
  ],
  exports: [EVENT_PUBLISHER],
})
export class IngestionModule {}
