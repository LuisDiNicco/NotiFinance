import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataModule } from '../market-data/market-data.module';
import { WATCHLIST_REPOSITORY } from './application/IWatchlistRepository';
import { WatchlistService } from './application/WatchlistService';
import { WatchlistController } from './infrastructure/primary-adapters/http/controllers/WatchlistController';
import { WatchlistItemEntity } from './infrastructure/secondary-adapters/database/entities/WatchlistItemEntity';
import { TypeOrmWatchlistRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmWatchlistRepository';

@Module({
  imports: [TypeOrmModule.forFeature([WatchlistItemEntity]), MarketDataModule],
  controllers: [WatchlistController],
  providers: [
    WatchlistService,
    {
      provide: WATCHLIST_REPOSITORY,
      useClass: TypeOrmWatchlistRepository,
    },
  ],
  exports: [WatchlistService],
})
export class WatchlistModule {}
