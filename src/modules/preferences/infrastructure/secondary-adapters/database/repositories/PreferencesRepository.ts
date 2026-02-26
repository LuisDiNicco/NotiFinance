import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPreferencesRepository } from '../../../../application/IPreferencesRepository';
import { UserPreference } from '../../../../domain/entities/UserPreference';
import { UserPreferenceEntity } from '../entities/UserPreferenceEntity';
import { UserPreferenceMapper } from '../maps/UserPreferenceMapper';

@Injectable()
export class PreferencesRepository implements IPreferencesRepository {
    constructor(
        @InjectRepository(UserPreferenceEntity)
        private readonly repo: Repository<UserPreferenceEntity>,
    ) { }

    async findByUserId(userId: string): Promise<UserPreference | null> {
        const entity = await this.repo.findOne({ where: { userId } });
        if (!entity) return null;

        return UserPreferenceMapper.toDomain(entity);
    }

    async save(preference: UserPreference): Promise<UserPreference> {
        let entity = await this.repo.findOne({ where: { userId: preference.userId } });

        const persistenceData = UserPreferenceMapper.toPersistence(preference);

        if (!entity) {
            entity = this.repo.create(persistenceData);
        } else {
            entity.optInChannels = persistenceData.optInChannels;
            entity.disabledEventTypes = persistenceData.disabledEventTypes;
            entity.quietHoursStart = persistenceData.quietHoursStart;
            entity.quietHoursEnd = persistenceData.quietHoursEnd;
            entity.digestFrequency = persistenceData.digestFrequency;
        }

        const saved = await this.repo.save(entity);
        return UserPreferenceMapper.toDomain(saved);
    }
}
