import { DollarQuote } from '../domain/entities/DollarQuote';

export const DOLLAR_QUOTE_REPOSITORY = 'IDollarQuoteRepository';

export interface IDollarQuoteRepository {
    saveMany(quotes: DollarQuote[]): Promise<void>;
    findLatestByType(): Promise<DollarQuote[]>;
    findLatestTimestamp(): Promise<Date | null>;
}