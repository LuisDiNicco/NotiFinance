import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '../../../../domain/enums/NotificationChannel';
import { UserPreference } from '../../../../domain/entities/UserPreference';
import { DigestFrequency } from '../../../../domain/enums/DigestFrequency';

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
    example: ['alert.risk.above'],
  })
  disabledEventTypes!: string[];

  @ApiProperty({
    description: 'Quiet hours start in HH:mm format',
    nullable: true,
    example: '22:00',
  })
  quietHoursStart!: string | null;

  @ApiProperty({
    description: 'Quiet hours end in HH:mm format',
    nullable: true,
    example: '07:00',
  })
  quietHoursEnd!: string | null;

  @ApiProperty({
    description: 'Digest frequency for notifications',
    enum: DigestFrequency,
    example: DigestFrequency.REALTIME,
  })
  digestFrequency!: DigestFrequency;

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
    response.quietHoursStart = entity.quietHoursStart;
    response.quietHoursEnd = entity.quietHoursEnd;
    response.digestFrequency = entity.digestFrequency;
    return response;
  }
}
