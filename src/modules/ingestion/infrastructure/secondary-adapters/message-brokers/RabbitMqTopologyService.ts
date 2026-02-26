import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';

@Injectable()
export class RabbitMqTopologyService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RabbitMqTopologyService.name);
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit(): Promise<void> {
        const rabbitMqUrl = this.configService.get<string>('integrations.rabbitmq.url');
        if (!rabbitMqUrl) {
            this.logger.warn('RABBITMQ_URL is missing. Skipping topology declaration.');
            return;
        }

        const connection = await connect(rabbitMqUrl);
        const channel = await connection.createChannel();

        this.connection = connection;
        this.channel = channel;

        await channel.assertExchange('notifinance.events', 'topic', { durable: true });

        await channel.assertQueue('alert-evaluation-queue.dlq', { durable: true });
        await channel.assertQueue('notification-events-queue.dlq', { durable: true });

        await channel.assertQueue('alert-evaluation-queue', {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': '',
                'x-dead-letter-routing-key': 'alert-evaluation-queue.dlq',
            },
        });

        await channel.assertQueue('notification-events-queue', {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': '',
                'x-dead-letter-routing-key': 'notification-events-queue.dlq',
            },
        });

        await channel.bindQueue('alert-evaluation-queue', 'notifinance.events', 'market.*');
        await channel.bindQueue('alert-evaluation-queue', 'notifinance.events', 'market.#');
        await channel.bindQueue('notification-events-queue', 'notifinance.events', 'alert.*');
        await channel.bindQueue('notification-events-queue', 'notifinance.events', 'alert.#');

        this.logger.log('RabbitMQ topology declared: notifinance.events + alert/notification queues with DLQ');
    }

    async onModuleDestroy(): Promise<void> {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }

        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }
}
