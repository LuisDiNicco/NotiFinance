import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventIngestionController } from './infrastructure/primary-adapters/http/controllers/EventIngestionController';
import { EventIngestionService } from './application/EventIngestionService';
import { RabbitMQEventPublisher, RABBITMQ_SERVICE } from './infrastructure/secondary-adapters/message-brokers/publishers/RabbitMQEventPublisher';
import { EVENT_PUBLISHER } from './application/IEventPublisher';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: RABBITMQ_SERVICE,
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') as string],
                        queue: 'notification_events',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [EventIngestionController],
    providers: [
        EventIngestionService,
        {
            provide: EVENT_PUBLISHER,
            useClass: RabbitMQEventPublisher,
        },
    ],
})
export class IngestionModule { }
