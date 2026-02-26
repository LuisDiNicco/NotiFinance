import { Inject, Injectable } from '@nestjs/common';
import {
  WATCHLIST_REPOSITORY,
  type IWatchlistRepository,
} from './IWatchlistRepository';
import { WatchlistItem } from '../domain/entities/WatchlistItem';
import { MarketDataService } from '../../market-data/application/MarketDataService';

@Injectable()
export class WatchlistService {
  constructor(
    @Inject(WATCHLIST_REPOSITORY)
    private readonly watchlistRepository: IWatchlistRepository,
    private readonly marketDataService: MarketDataService,
  ) {}

  public async getUserWatchlist(userId: string): Promise<WatchlistItem[]> {
    return this.watchlistRepository.findByUserId(userId);
  }

  public async addToWatchlist(
    userId: string,
    ticker: string,
  ): Promise<WatchlistItem> {
    const asset = await this.marketDataService.getAssetByTicker(ticker);

    if (!asset.id) {
      throw new Error(`Asset ${ticker} has no persistent id`);
    }

    const existing = await this.watchlistRepository.findByUserAndAsset(
      userId,
      asset.id,
    );
    if (existing) {
      return existing;
    }

    return this.watchlistRepository.save(
      new WatchlistItem({ userId, assetId: asset.id }),
    );
  }

  public async removeFromWatchlist(
    userId: string,
    ticker: string,
  ): Promise<void> {
    const asset = await this.marketDataService.getAssetByTicker(ticker);
    if (!asset.id) {
      return;
    }

    const existing = await this.watchlistRepository.findByUserAndAsset(
      userId,
      asset.id,
    );
    if (!existing?.id) {
      return;
    }

    await this.watchlistRepository.deleteById(existing.id);
  }
}
