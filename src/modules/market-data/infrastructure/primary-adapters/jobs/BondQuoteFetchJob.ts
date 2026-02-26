import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';

@Injectable()
export class BondQuoteFetchJob {
    private readonly logger = new Logger(BondQuoteFetchJob.name);

    constructor(private readonly marketDataService: MarketDataService) { }

    @Cron('*/15 10-17 * * 1-5')
    public async handle(): Promise<void> {
        const startedAt = Date.now();

        try {
            const updatedCount = await this.marketDataService.refreshBondQuotes();
            const durationMs = Date.now() - startedAt;
            this.logger.log(`Bond quotes refreshed (${updatedCount} assets) in ${durationMs}ms`);
        } catch (error) {
            const durationMs = Date.now() - startedAt;
            this.logger.error(`Bond quotes refresh failed after ${durationMs}ms`, error as Error);
        }
    }
}
