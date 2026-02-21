import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPreferencesRepository } from './IPreferencesRepository';
import { PREFERENCES_REPO } from './IPreferencesRepository';
import { NotificationChannel, UserPreference } from '../domain/entities/UserPreference';

@Injectable()
export class PreferencesService {
    constructor(
        @Inject(PREFERENCES_REPO)
        private readonly repo: IPreferencesRepository,
    ) { }

    public async getPreferences(userId: string): Promise<UserPreference> {
        const prefs = await this.repo.findByUserId(userId);
        if (!prefs) {
            throw new NotFoundException(`Preferences for user ${userId} not found`);
        }
        return prefs;
    }

    public async createOrUpdatePreferences(
        userId: string,
        channels: NotificationChannel[],
        disabledEvents: string[]
    ): Promise<UserPreference> {
        const prefs = new UserPreference(userId, channels, disabledEvents);
        return this.repo.save(prefs);
    }
}
