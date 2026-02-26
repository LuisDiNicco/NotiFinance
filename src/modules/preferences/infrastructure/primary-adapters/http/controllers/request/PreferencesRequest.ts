import { IsArray, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '../../../../../domain/enums/NotificationChannel';
import { UserPreference } from '../../../../../domain/entities/UserPreference';

export class PreferencesRequest {
    @ApiProperty({
        description: 'Unique user identifier',
        example: 'user-123',
    })
    @IsString()
    userId!: string;

    @ApiProperty({
        description: 'Notification channels enabled by the user',
        enum: NotificationChannel,
        isArray: true,
        example: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
    })
    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    optInChannels!: NotificationChannel[];

    @ApiProperty({
        description: 'Event types disabled for this user',
        isArray: true,
        example: ['alert.risk.above'],
    })
    @IsArray()
    @IsString({ each: true })
    disabledEventTypes!: string[];

    /**
     * Converts the request DTO to a domain entity.
     * Ensures proper validation and type conversion before business logic processing.
     */
    toEntity(): UserPreference {
        return new UserPreference(
            this.userId,
            this.optInChannels,
            this.disabledEventTypes,
        );
    }
}
