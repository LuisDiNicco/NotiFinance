import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPreferencesRepository } from '../../../../application/IPreferencesRepository';
import { UserPreference } from '../../../../domain/entities/UserPreference';
import { UserPreferenceEntity } from '../entities/UserPreferenceEntity';

@Injectable()
export class PreferencesRepository implements IPreferencesRepository {
    constructor(
        @InjectRepository(UserPreferenceEntity)
        private readonly repo: Repository<UserPreferenceEntity>,
    ) { }

    async findByUserId(userId: string): Promise<UserPreference | null> {
        const entity = await this.repo.findOne({ where: { userId } });
        if (!entity) return null;

        const domain = new UserPreference(entity.userId, entity.optInChannels, entity.disabledEventTypes);
        domain.id = entity.id;
        return domain;
    }

    async save(preference: UserPreference): Promise<UserPreference> {
        let entity = await this.repo.findOne({ where: { userId: preference.userId } });

        if (!entity) {
            entity = this.repo.create({
                userId: preference.userId,
                optInChannels: preference.optInChannels,
                disabledEventTypes: preference.disabledEventTypes,
            });
        } else {
            entity.optInChannels = preference.optInChannels;
            entity.disabledEventTypes = preference.disabledEventTypes;
        }

        const saved = await this.repo.save(entity);
        const domain = new UserPreference(saved.userId, saved.optInChannels, saved.disabledEventTypes);
        domain.id = saved.id;
        return domain;
    }
}
