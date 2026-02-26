import { EventPayload } from '../domain/EventPayload';

export const EVENT_PUBLISHER = 'IEventPublisher';

export interface IEventPublisher {
  publishEvent(event: EventPayload, correlationId: string): Promise<void>;
}
