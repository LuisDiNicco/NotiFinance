import { DollarQuote } from '../domain/entities/DollarQuote';
import { DollarType } from '../domain/enums/DollarType';

export const DOLLAR_QUOTE_REPOSITORY = 'IDollarQuoteRepository';

export interface IDollarQuoteRepository {
  saveMany(quotes: DollarQuote[]): Promise<void>;
  findLatestByType(): Promise<DollarQuote[]>;
  findHistoryByType(type: DollarType, days: number): Promise<DollarQuote[]>;
  findLatestTimestamp(): Promise<Date | null>;
}
