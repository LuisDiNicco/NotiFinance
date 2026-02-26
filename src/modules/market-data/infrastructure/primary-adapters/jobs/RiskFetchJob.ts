import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';
import { MarketGateway } from '../../secondary-adapters/websockets/MarketGateway';

@Injectable()
export class RiskFetchJob {
  private readonly logger = new Logger(RiskFetchJob.name);

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly marketGateway: MarketGateway,
  ) {}

  @Cron('*/10 * * * *')
  public async handle(): Promise<void> {
    const startedAt = Date.now();

    try {
      const latest = await this.marketDataService.refreshRiskData();
      this.marketGateway.emitRisk(latest);
      const durationMs = Date.now() - startedAt;
      this.logger.log(`Country risk refreshed in ${durationMs}ms`);
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      this.logger.error(
        `Country risk refresh failed after ${durationMs}ms`,
        error as Error,
      );
    }
  }
}
