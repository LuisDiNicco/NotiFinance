import { MarketQuote } from '../domain/entities/MarketQuote';
import { AssetType } from '../domain/enums/AssetType';

export const QUOTE_REPOSITORY = 'IQuoteRepository';

export interface IQuoteRepository {
  saveBulkQuotes(quotes: MarketQuote[]): Promise<void>;
  findByAssetAndPeriod(
    assetId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MarketQuote[]>;
  findLatestByAsset(assetId: string): Promise<MarketQuote | null>;
  findLatestTimestamp(): Promise<Date | null>;
  findTopMovers(
    assetType: AssetType,
    limit: number,
  ): Promise<{ gainers: MarketQuote[]; losers: MarketQuote[] }>;
}
