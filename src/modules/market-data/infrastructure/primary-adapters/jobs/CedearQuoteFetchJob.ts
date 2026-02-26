import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';

@Injectable()
export class CedearQuoteFetchJob {
    private readonly logger = new Logger(CedearQuoteFetchJob.name);

    constructor(private readonly marketDataService: MarketDataService) { }

    @Cron('*/5 10-17 * * 1-5')
    public async handle(): Promise<void> {
        const startedAt = Date.now();

        try {
            const updatedCount = await this.marketDataService.refreshCedearQuotes();
            const durationMs = Date.now() - startedAt;
            this.logger.log(`Cedear quotes refreshed (${updatedCount} assets) in ${durationMs}ms`);
        } catch (error) {
            const durationMs = Date.now() - startedAt;
            this.logger.error(`Cedear quotes refresh failed after ${durationMs}ms`, error as Error);
        }
    }
}
