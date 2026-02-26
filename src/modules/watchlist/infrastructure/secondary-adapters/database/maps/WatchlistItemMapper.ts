import { WatchlistItem } from '../../../../domain/entities/WatchlistItem';
import { WatchlistItemEntity } from '../entities/WatchlistItemEntity';

export class WatchlistItemMapper {
    public static toDomain(entity: WatchlistItemEntity): WatchlistItem {
        const item = new WatchlistItem({
            userId: entity.userId,
            assetId: entity.assetId,
            createdAt: entity.createdAt,
        });

        item.id = entity.id;
        return item;
    }

    public static toPersistence(domain: WatchlistItem): WatchlistItemEntity {
        const entity = new WatchlistItemEntity();
        if (domain.id) {
            entity.id = domain.id;
        }

        entity.userId = domain.userId;
        entity.assetId = domain.assetId;
        return entity;
    }
}
