import { UserPreference } from '../domain/entities/UserPreference';

export const PREFERENCES_REPO = 'IPreferencesRepository';

export interface IPreferencesRepository {
  findByUserId(userId: string): Promise<UserPreference | null>;
  save(preference: UserPreference): Promise<UserPreference>;
}
