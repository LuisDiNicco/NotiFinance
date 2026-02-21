import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventPayload } from '../domain/EventPayload';
import type { IEventPublisher } from './IEventPublisher';
import { EVENT_PUBLISHER } from './IEventPublisher';

@Injectable()
export class EventIngestionService {
    private readonly logger = new Logger(EventIngestionService.name);

    constructor(
        @Inject(EVENT_PUBLISHER)
        private readonly eventPublisher: IEventPublisher,
    ) { }

    public async processEvent(event: EventPayload, correlationId: string): Promise<void> {
        this.logger.debug(`Processing event ${event.eventId} of type ${event.eventType}`);

        await this.eventPublisher.publishEvent(event, correlationId);

        this.logger.log(`Event ${event.eventId} successfully published to broker`);
    }
}
