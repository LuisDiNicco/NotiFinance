import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';

@Entity('country_risk')
@Index('IDX_country_risk_timestamp', ['timestamp'])
export class CountryRiskEntity extends BaseEntity {
    @Column({ type: 'numeric', precision: 18, scale: 4 })
    value!: number;

    @Column({ type: 'numeric', precision: 8, scale: 4, default: 0 })
    changePct!: number;

    @Column({ type: 'timestamp' })
    timestamp!: Date;
}