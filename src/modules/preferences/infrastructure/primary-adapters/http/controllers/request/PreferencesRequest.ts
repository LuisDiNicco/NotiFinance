import { IsArray, IsEnum, IsString } from 'class-validator';
import { NotificationChannel } from '../../../../../domain/entities/UserPreference';

export class PreferencesRequest {
    @IsString()
    userId!: string;

    @IsArray()
    @IsEnum(NotificationChannel, { each: true })
    optInChannels!: NotificationChannel[];

    @IsArray()
    @IsString({ each: true })
    disabledEventTypes!: string[];
}
