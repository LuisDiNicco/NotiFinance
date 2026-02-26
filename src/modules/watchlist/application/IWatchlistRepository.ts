import { WatchlistItem } from '../domain/entities/WatchlistItem';

export const WATCHLIST_REPOSITORY = 'IWatchlistRepository';

export interface IWatchlistRepository {
    findByUserId(userId: string): Promise<WatchlistItem[]>;
    findByUserAndAsset(userId: string, assetId: string): Promise<WatchlistItem | null>;
    save(item: WatchlistItem): Promise<WatchlistItem>;
    deleteById(id: string): Promise<void>;
}
