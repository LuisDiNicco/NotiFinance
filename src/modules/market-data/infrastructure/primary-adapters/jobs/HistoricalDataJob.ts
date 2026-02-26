import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';

@Injectable()
export class HistoricalDataJob {
    private readonly logger = new Logger(HistoricalDataJob.name);

    constructor(private readonly marketDataService: MarketDataService) { }

    @Cron('0 18 * * 1-5')
    public async handle(): Promise<void> {
        const startedAt = Date.now();

        try {
            const [stocks, cedears, bonds] = await Promise.all([
                this.marketDataService.refreshStockQuotes(),
                this.marketDataService.refreshCedearQuotes(),
                this.marketDataService.refreshBondQuotes(),
            ]);

            const durationMs = Date.now() - startedAt;
            this.logger.log(
                `Historical consolidation completed in ${durationMs}ms (stocks=${stocks}, cedears=${cedears}, bonds=${bonds})`,
            );
        } catch (error) {
            const durationMs = Date.now() - startedAt;
            this.logger.error(`Historical consolidation failed after ${durationMs}ms`, error as Error);
        }
    }
}
