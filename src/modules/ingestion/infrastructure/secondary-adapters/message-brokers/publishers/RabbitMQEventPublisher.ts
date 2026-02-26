import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IEventPublisher } from '../../../../application/IEventPublisher';
import { EventPayload } from '../../../../domain/EventPayload';

export const RABBITMQ_SERVICE = 'RABBITMQ_SERVICE';

@Injectable()
export class RabbitMQEventPublisher implements IEventPublisher {
    private readonly logger = new Logger(RabbitMQEventPublisher.name);

    constructor(
        @Inject(RABBITMQ_SERVICE) private readonly rabbitClient: ClientProxy,
    ) { }

    async publishEvent(event: EventPayload, correlationId: string): Promise<void> {
        try {
            const message = {
                payload: event,
                options: {
                    headers: {
                        'x-correlation-id': correlationId,
                    }
                }
            };

            await firstValueFrom(this.rabbitClient.emit(`notification.${event.eventType}`, message));

            this.logger.debug(`Successfully emitted event to RabbitMQ Exchange: notification.${event.eventType}`);
        } catch (error) {
            this.logger.error(`Failed to publish event ${event.eventId} to RabbitMQ`, error);
            throw new Error(`Failed to publish event (RabbitMQ Publisher): ${(error as Error).message}`);
        }
    }
}
