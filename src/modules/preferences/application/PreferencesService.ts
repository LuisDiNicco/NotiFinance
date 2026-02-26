import { Inject, Injectable } from '@nestjs/common';
import type { IPreferencesRepository } from './IPreferencesRepository';
import { PREFERENCES_REPO } from './IPreferencesRepository';
import { NotificationChannel } from '../domain/enums/NotificationChannel';
import { UserPreference } from '../domain/entities/UserPreference';
import { PreferencesNotFoundError } from '../domain/errors/PreferencesNotFoundError';
import { DigestFrequency } from '../domain/enums/DigestFrequency';

@Injectable()
export class PreferencesService {
    constructor(
        @Inject(PREFERENCES_REPO)
        private readonly repo: IPreferencesRepository,
    ) { }

    public async getPreferences(userId: string): Promise<UserPreference> {
        const prefs = await this.repo.findByUserId(userId);
        if (!prefs) {
            throw new PreferencesNotFoundError(userId);
        }
        return prefs;
    }

    public async createOrUpdatePreferences(
        userId: string,
        channels: NotificationChannel[],
        disabledEvents: string[],
        quietHoursStart: string | null,
        quietHoursEnd: string | null,
        digestFrequency: DigestFrequency,
    ): Promise<UserPreference> {
        const prefs = new UserPreference(
            userId,
            channels,
            disabledEvents,
            quietHoursStart,
            quietHoursEnd,
            digestFrequency,
        );
        return this.repo.save(prefs);
    }
}
