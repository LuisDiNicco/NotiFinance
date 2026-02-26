import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '../../../../../domain/enums/NotificationChannel';
import { UserPreference } from '../../../../../domain/entities/UserPreference';
import { DigestFrequency } from '../../../../../domain/enums/DigestFrequency';

export class PreferencesRequest {
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

  @ApiProperty({
    description: 'Quiet hours start in HH:mm format',
    required: false,
    nullable: true,
    example: '22:00',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  quietHoursStart?: string | null;

  @ApiProperty({
    description: 'Quiet hours end in HH:mm format',
    required: false,
    nullable: true,
    example: '07:00',
  })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
  quietHoursEnd?: string | null;

  @ApiProperty({
    description: 'Digest frequency for notifications',
    enum: DigestFrequency,
    default: DigestFrequency.REALTIME,
    required: false,
  })
  @IsOptional()
  @IsEnum(DigestFrequency)
  digestFrequency?: DigestFrequency;

  /**
   * Converts the request DTO to a domain entity.
   * Ensures proper validation and type conversion before business logic processing.
   */
  toEntity(userId: string): UserPreference {
    return new UserPreference(
      userId,
      this.optInChannels,
      this.disabledEventTypes,
      this.quietHoursStart ?? null,
      this.quietHoursEnd ?? null,
      this.digestFrequency ?? DigestFrequency.REALTIME,
    );
  }
}
