import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type ICountryRiskRepository } from '../../../../application/ICountryRiskRepository';
import { CountryRisk } from '../../../../domain/entities/CountryRisk';
import { CountryRiskEntity } from '../entities/CountryRiskEntity';

@Injectable()
export class TypeOrmCountryRiskRepository implements ICountryRiskRepository {
    constructor(
        @InjectRepository(CountryRiskEntity)
        private readonly repository: Repository<CountryRiskEntity>,
    ) { }

    public async save(risk: CountryRisk): Promise<void> {
        const entity = this.repository.create({
            value: risk.value,
            changePct: risk.changePct,
            timestamp: risk.timestamp,
        });

        await this.repository.save(entity);
    }

    public async findLatest(): Promise<CountryRisk | null> {
        const entity = await this.repository.findOne({
            order: { timestamp: 'DESC' },
        });

        if (!entity) {
            return null;
        }

        return new CountryRisk(
            Number(entity.value),
            Number(entity.changePct),
            entity.timestamp,
        );
    }
}