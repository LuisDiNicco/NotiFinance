import { IsArray, IsEnum, IsString } from 'class-validator';
import { NotificationChannel } from '../../../../../domain/enums/NotificationChannel';
import { UserPreference } from '../../../../../domain/entities/UserPreference';

export class PreferencesRequest {
    @IsString()
    userId!: string;

    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    optInChannels!: NotificationChannel[];

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
