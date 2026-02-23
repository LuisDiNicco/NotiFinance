import { IsEnum, IsObject, IsString, IsUUID } from 'class-validator';
import { EventPayload } from '../../../../../domain/EventPayload';
import { EventType } from '../../../../../domain/enums/EventType';

export class EventPayloadRequest {
    @IsUUID('4', { message: 'eventId must be a valid UUID v4' })
    eventId!: string;

    @IsEnum(EventType, { message: 'Invalid eventType provided' })
    eventType!: EventType;

    @IsString({ message: 'recipientId must be a valid string' })
    recipientId!: string;

    @IsObject({ message: 'metadata must be a JSON object' })
    metadata!: Record<string, unknown>;

    public toEntity(): EventPayload {
        return new EventPayload(
            this.eventId,
            this.eventType,
            this.recipientId,
            this.metadata,
        );
    }
}
