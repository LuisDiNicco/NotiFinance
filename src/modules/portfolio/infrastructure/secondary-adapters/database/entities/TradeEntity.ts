import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';
import { TradeType } from '../../../../domain/enums/TradeType';

@Entity('trades')
@Index('IDX_trades_portfolio_executed', ['portfolioId', 'executedAt'])
export class TradeEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  portfolioId!: string;

  @Column({ type: 'uuid' })
  assetId!: string;

  @Column({ type: 'varchar', length: 10 })
  tradeType!: TradeType;

  @Column({ type: 'numeric', precision: 18, scale: 6 })
  quantity!: number;

  @Column({ type: 'numeric', precision: 18, scale: 6 })
  pricePerUnit!: number;

  @Column({ type: 'varchar', length: 10 })
  currency!: string;

  @Column({ type: 'numeric', precision: 18, scale: 6, default: 0 })
  commission!: number;

  @Column({ type: 'timestamp' })
  executedAt!: Date;
}
