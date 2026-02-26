import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionModule } from '../ingestion/ingestion.module';
import { MarketDataService } from './application/MarketDataService';
import { ASSET_REPOSITORY } from './application/IAssetRepository';
import { DOLLAR_PROVIDER } from './application/IDollarProvider';
import { RISK_PROVIDER } from './application/IRiskProvider';
import { DOLLAR_QUOTE_REPOSITORY } from './application/IDollarQuoteRepository';
import { COUNTRY_RISK_REPOSITORY } from './application/ICountryRiskRepository';
import {
  QUOTE_FALLBACK_PROVIDER,
  QUOTE_PROVIDER,
} from './application/IQuoteProvider';
import { QUOTE_REPOSITORY } from './application/IQuoteRepository';
import { MARKET_CACHE } from './application/IMarketCache';
import { TypeOrmAssetRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmAssetRepository';
import { TypeOrmDollarQuoteRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmDollarQuoteRepository';
import { TypeOrmCountryRiskRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmCountryRiskRepository';
import { TypeOrmQuoteRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmQuoteRepository';
import { RedisMarketCache } from './infrastructure/secondary-adapters/cache/RedisMarketCache';
import { AssetEntity } from './infrastructure/secondary-adapters/database/entities/AssetEntity';
import { DollarQuoteEntity } from './infrastructure/secondary-adapters/database/entities/DollarQuoteEntity';
import { CountryRiskEntity } from './infrastructure/secondary-adapters/database/entities/CountryRiskEntity';
import { MarketQuoteEntity } from './infrastructure/secondary-adapters/database/entities/MarketQuoteEntity';
import { DolarApiClient } from './infrastructure/secondary-adapters/http/clients/DolarApiClient';
import { RiskProviderClient } from './infrastructure/secondary-adapters/http/clients/RiskProviderClient';
import { YahooFinanceClient } from './infrastructure/secondary-adapters/http/clients/YahooFinanceClient';
import { AlphaVantageClient } from './infrastructure/secondary-adapters/http/clients/AlphaVantageClient';
import { MarketController } from './infrastructure/primary-adapters/http/controllers/MarketController';
import { AssetController } from './infrastructure/primary-adapters/http/controllers/AssetController';
import { SearchController } from './infrastructure/primary-adapters/http/controllers/SearchController';
import { DollarFetchJob } from './infrastructure/primary-adapters/jobs/DollarFetchJob';
import { RiskFetchJob } from './infrastructure/primary-adapters/jobs/RiskFetchJob';
import { StockQuoteFetchJob } from './infrastructure/primary-adapters/jobs/StockQuoteFetchJob';
import { CedearQuoteFetchJob } from './infrastructure/primary-adapters/jobs/CedearQuoteFetchJob';
import { BondQuoteFetchJob } from './infrastructure/primary-adapters/jobs/BondQuoteFetchJob';
import { HistoricalDataJob } from './infrastructure/primary-adapters/jobs/HistoricalDataJob';
import { MarketGateway } from './infrastructure/secondary-adapters/websockets/MarketGateway';

@Module({
  imports: [
    ConfigModule,
    IngestionModule,
    TypeOrmModule.forFeature([
      AssetEntity,
      MarketQuoteEntity,
      DollarQuoteEntity,
      CountryRiskEntity,
    ]),
  ],
  controllers: [MarketController, AssetController, SearchController],
  providers: [
    MarketDataService,
    {
      provide: ASSET_REPOSITORY,
      useClass: TypeOrmAssetRepository,
    },
    {
      provide: DOLLAR_QUOTE_REPOSITORY,
      useClass: TypeOrmDollarQuoteRepository,
    },
    {
      provide: COUNTRY_RISK_REPOSITORY,
      useClass: TypeOrmCountryRiskRepository,
    },
    {
      provide: QUOTE_REPOSITORY,
      useClass: TypeOrmQuoteRepository,
    },
    {
      provide: DOLLAR_PROVIDER,
      useClass: DolarApiClient,
    },
    {
      provide: RISK_PROVIDER,
      useClass: RiskProviderClient,
    },
    {
      provide: QUOTE_PROVIDER,
      useClass: YahooFinanceClient,
    },
    {
      provide: QUOTE_FALLBACK_PROVIDER,
      useClass: AlphaVantageClient,
    },
    {
      provide: MARKET_CACHE,
      useClass: RedisMarketCache,
    },
    DollarFetchJob,
    RiskFetchJob,
    StockQuoteFetchJob,
    CedearQuoteFetchJob,
    BondQuoteFetchJob,
    HistoricalDataJob,
    MarketGateway,
  ],
  exports: [MarketDataService],
})
export class MarketDataModule {}
