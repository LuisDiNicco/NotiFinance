import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';

@Entity('portfolios')
@Index('IDX_portfolios_user_created', ['userId', 'createdAt'])
export class PortfolioEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;
}
