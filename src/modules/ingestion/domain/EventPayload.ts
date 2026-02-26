import { EventType } from './enums/EventType';

export class EventPayload {
  constructor(
    public readonly eventId: string,
    public readonly eventType: EventType,
    public readonly recipientId: string,
    public readonly metadata: Record<string, unknown>,
  ) {}
}
