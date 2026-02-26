import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';

@Injectable()
export class DollarFetchJob {
    private readonly logger = new Logger(DollarFetchJob.name);

    constructor(private readonly marketDataService: MarketDataService) { }

    @Cron('*/5 * * * *')
    public async handle(): Promise<void> {
        const startedAt = Date.now();

        try {
            await this.marketDataService.refreshDollarData();
            const durationMs = Date.now() - startedAt;
            this.logger.log(`Dollar data refreshed in ${durationMs}ms`);
        } catch (error) {
            const durationMs = Date.now() - startedAt;
            this.logger.error(`Dollar refresh failed after ${durationMs}ms`, error as Error);
        }
    }
}
