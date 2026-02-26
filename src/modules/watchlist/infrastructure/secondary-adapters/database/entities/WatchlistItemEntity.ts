import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../../../../shared/infrastructure/base/database/BaseEntity';

@Entity('watchlist_items')
@Unique('UQ_watchlist_user_asset', ['userId', 'assetId'])
@Index('IDX_watchlist_user_created', ['userId', 'createdAt'])
export class WatchlistItemEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  assetId!: string;
}
