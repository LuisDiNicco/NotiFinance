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

        await channel.assertQueue('notification_events.dlq', { durable: true });
        this.logger.log('RabbitMQ DLQ topology declared: notification_events.dlq');
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
