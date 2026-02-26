import { MarketQuote } from '../domain/entities/MarketQuote';

export const QUOTE_PROVIDER = 'IQuoteProvider';
export const QUOTE_FALLBACK_PROVIDER = 'IQuoteFallbackProvider';

export interface IQuoteProvider {
    fetchQuote(yahooTicker: string): Promise<MarketQuote>;
    fetchHistorical(yahooTicker: string, startDate: Date, endDate: Date): Promise<MarketQuote[]>;
    fetchBulkQuotes(yahooTickers: string[]): Promise<MarketQuote[]>;
}
