import { DollarQuote } from '../domain/entities/DollarQuote';

export const DOLLAR_PROVIDER = 'IDollarProvider';

export interface IDollarProvider {
    fetchAllDollarQuotes(): Promise<DollarQuote[]>;
}
