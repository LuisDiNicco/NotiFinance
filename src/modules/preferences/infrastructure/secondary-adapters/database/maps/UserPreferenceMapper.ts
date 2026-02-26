import { NotificationChannel } from '../../../../domain/enums/NotificationChannel';
import { UserPreference } from '../../../../domain/entities/UserPreference';
import { DigestFrequency } from '../../../../domain/enums/DigestFrequency';
import { UserPreferenceEntity } from '../entities/UserPreferenceEntity';

/**
 * Maps between the database entity (UserPreferenceEntity) and domain entity (UserPreference).
 * Provides clean separation and prevents leaking ORM concerns into business logic.
 */
export class UserPreferenceMapper {
  /**
   * Maps a raw database entity to a domain entity.
   * @param entity The database entity from TypeORM
   * @returns A domain entity ready for use in business logic
   */
  static toDomain(
    entity:
      | UserPreferenceEntity
      | {
          id: string;
          userId: string;
          optInChannels: NotificationChannel[];
          disabledEventTypes: string[];
          quietHoursStart: string | null;
          quietHoursEnd: string | null;
          digestFrequency: DigestFrequency;
        },
  ): UserPreference {
    const domain = new UserPreference(
      entity.userId,
      entity.optInChannels,
      entity.disabledEventTypes,
      entity.quietHoursStart,
      entity.quietHoursEnd,
      entity.digestFrequency,
    );
    domain.id = entity.id;
    return domain;
  }

  /**
   * Maps a domain entity to a database persistence format.
   * @param domain The domain entity
   * @returns An object ready for persistence in the database
   */
  static toPersistence(domain: UserPreference): {
    userId: string;
    optInChannels: NotificationChannel[];
    disabledEventTypes: string[];
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    digestFrequency: DigestFrequency;
  } {
    return {
      userId: domain.userId,
      optInChannels: domain.optInChannels,
      disabledEventTypes: domain.disabledEventTypes,
      quietHoursStart: domain.quietHoursStart,
      quietHoursEnd: domain.quietHoursEnd,
      digestFrequency: domain.digestFrequency,
    };
  }
}
