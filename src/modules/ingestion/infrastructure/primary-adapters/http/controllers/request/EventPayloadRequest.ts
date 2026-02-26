import { IsEnum, IsObject, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventPayload } from '../../../../../domain/EventPayload';
import { EventType } from '../../../../../domain/enums/EventType';

export class EventPayloadRequest {
    @ApiProperty({
        description: 'Unique event identifier (UUID v4)',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID('4', { message: 'eventId must be a valid UUID v4' })
    eventId!: string;

    @ApiProperty({
        description: 'Domain event type to process',
        enum: EventType,
        example: EventType.MARKET_QUOTE_UPDATED,
    })
    @IsEnum(EventType, { message: 'Invalid eventType provided' })
    eventType!: EventType;

    @ApiProperty({
        description: 'Business recipient identifier',
        example: 'user-123',
    })
    @IsString({ message: 'recipientId must be a valid string' })
    recipientId!: string;

    @ApiProperty({
        description: 'Event metadata used at notification compilation time',
        example: { amount: 42, currency: 'USD' },
    })
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
