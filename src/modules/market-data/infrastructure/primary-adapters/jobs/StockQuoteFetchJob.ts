import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';

@Injectable()
export class StockQuoteFetchJob {
    private readonly logger = new Logger(StockQuoteFetchJob.name);

    constructor(private readonly marketDataService: MarketDataService) { }

    @Cron('*/5 10-17 * * 1-5')
    public async handle(): Promise<void> {
        const startedAt = Date.now();

        try {
            const updatedCount = await this.marketDataService.refreshStockQuotes();
            const durationMs = Date.now() - startedAt;
            this.logger.log(`Stock quotes refreshed (${updatedCount} assets) in ${durationMs}ms`);
        } catch (error) {
            const durationMs = Date.now() - startedAt;
            this.logger.error(`Stock quotes refresh failed after ${durationMs}ms`, error as Error);
        }
    }
}
