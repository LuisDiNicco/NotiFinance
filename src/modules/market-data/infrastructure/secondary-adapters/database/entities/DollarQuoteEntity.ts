import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';

@Entity('dollar_quotes')
@Index('IDX_dollar_quotes_type_timestamp', ['type', 'timestamp'])
export class DollarQuoteEntity extends BaseEntity {
    @Column({ type: 'varchar', length: 20 })
    type!: string;

    @Column({ type: 'numeric', precision: 18, scale: 4 })
    buyPrice!: number;

    @Column({ type: 'numeric', precision: 18, scale: 4 })
    sellPrice!: number;

    @Column({ type: 'varchar', length: 100 })
    source!: string;

    @Column({ type: 'timestamp' })
    timestamp!: Date;
}