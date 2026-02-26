import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';

@Injectable()
export class RiskFetchJob {
    private readonly logger = new Logger(RiskFetchJob.name);

    constructor(private readonly marketDataService: MarketDataService) { }

    @Cron('*/10 * * * *')
    public async handle(): Promise<void> {
        const startedAt = Date.now();

        try {
            await this.marketDataService.refreshRiskData();
            const durationMs = Date.now() - startedAt;
            this.logger.log(`Country risk refreshed in ${durationMs}ms`);
        } catch (error) {
            const durationMs = Date.now() - startedAt;
            this.logger.error(`Country risk refresh failed after ${durationMs}ms`, error as Error);
        }
    }
}
