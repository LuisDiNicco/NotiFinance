import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IWatchlistRepository } from '../../../../application/IWatchlistRepository';
import { WatchlistItem } from '../../../../domain/entities/WatchlistItem';
import { WatchlistItemEntity } from '../entities/WatchlistItemEntity';
import { WatchlistItemMapper } from '../maps/WatchlistItemMapper';

@Injectable()
export class TypeOrmWatchlistRepository implements IWatchlistRepository {
  constructor(
    @InjectRepository(WatchlistItemEntity)
    private readonly repository: Repository<WatchlistItemEntity>,
  ) {}

  public async findByUserId(userId: string): Promise<WatchlistItem[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => WatchlistItemMapper.toDomain(entity));
  }

  public async findByUserAndAsset(
    userId: string,
    assetId: string,
  ): Promise<WatchlistItem | null> {
    const entity = await this.repository.findOne({
      where: { userId, assetId },
    });
    return entity ? WatchlistItemMapper.toDomain(entity) : null;
  }

  public async save(item: WatchlistItem): Promise<WatchlistItem> {
    const entity = WatchlistItemMapper.toPersistence(item);
    const saved = await this.repository.save(entity);
    return WatchlistItemMapper.toDomain(saved);
  }

  public async deleteById(id: string): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
