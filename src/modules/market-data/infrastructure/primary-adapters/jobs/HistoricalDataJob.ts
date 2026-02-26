import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MarketDataService } from '../../../application/MarketDataService';
import { MarketGateway } from '../../secondary-adapters/websockets/MarketGateway';

@Injectable()
export class HistoricalDataJob {
  private readonly logger = new Logger(HistoricalDataJob.name);

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly marketGateway: MarketGateway,
  ) {}

  @Cron('0 18 * * 1-5')
  public async handle(): Promise<void> {
    const startedAt = Date.now();

    try {
      const [stocks, cedears, bonds] = await Promise.all([
        this.marketDataService.refreshStockQuotes(),
        this.marketDataService.refreshCedearQuotes(),
        this.marketDataService.refreshBondQuotes(),
      ]);

      for (const update of [
        ...stocks.updates,
        ...cedears.updates,
        ...bonds.updates,
      ]) {
        this.marketGateway.emitQuoteUpdated(update);
      }

      const status = await this.marketDataService.getMarketStatus();
      this.marketGateway.emitMarketStatus({
        isOpen: status.marketOpen,
        phase: status.marketOpen ? 'OPEN' : 'CLOSED',
      });

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `Historical consolidation completed in ${durationMs}ms (stocks=${stocks.updatedCount}, cedears=${cedears.updatedCount}, bonds=${bonds.updatedCount})`,
      );
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      this.logger.error(
        `Historical consolidation failed after ${durationMs}ms`,
        error as Error,
      );
    }
  }
}
