import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '../../../../domain/enums/NotificationChannel';
import { UserPreference } from '../../../../domain/entities/UserPreference';

export class UserPreferenceResponse {
    @ApiProperty({
        description: 'Unique identifier for the user preference',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    id!: string;

    @ApiProperty({
        description: 'User ID associated with these preferences',
        example: 'user-123',
    })
    userId!: string;

    @ApiProperty({
        description: 'Notification channels the user has opted in to',
        enum: NotificationChannel,
        isArray: true,
        example: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    })
    optInChannels!: NotificationChannel[];

    @ApiProperty({
        description: 'Event types the user has disabled globally',
        isArray: true,
        example: ['security.login_alert'],
    })
    disabledEventTypes!: string[];

    /**
     * Factory method to convert a domain entity to a response DTO.
     * Ensures domain structure is never leaked directly to client.
     */
    static fromEntity(entity: UserPreference): UserPreferenceResponse {
        const response = new UserPreferenceResponse();
        response.id = entity.id || '';
        response.userId = entity.userId;
        response.optInChannels = entity.optInChannels;
        response.disabledEventTypes = entity.disabledEventTypes;
        return response;
    }
}
