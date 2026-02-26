import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';
import { MarketGateway } from '../../secondary-adapters/websockets/MarketGateway';

@Injectable()
export class BondQuoteFetchJob {
  private readonly logger = new Logger(BondQuoteFetchJob.name);

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly marketGateway: MarketGateway,
  ) {}

  @Cron('*/15 10-17 * * 1-5')
  public async handle(): Promise<void> {
    const startedAt = Date.now();

    try {
      const { updatedCount, updates } =
        await this.marketDataService.refreshBondQuotes();
      for (const update of updates) {
        this.marketGateway.emitQuoteUpdated(update);
      }

      const status = await this.marketDataService.getMarketStatus();
      this.marketGateway.emitMarketStatus({
        isOpen: status.marketOpen,
        phase: status.marketOpen ? 'OPEN' : 'CLOSED',
      });

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `Bond quotes refreshed (${updatedCount} assets) in ${durationMs}ms`,
      );
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      this.logger.error(
        `Bond quotes refresh failed after ${durationMs}ms`,
        error as Error,
      );
    }
  }
}
