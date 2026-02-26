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

      this.marketGateway.emitQuoteUpdated({
        scope: 'historical:stocks',
        updatedCount: stocks,
        refreshedAt: new Date().toISOString(),
      });
      this.marketGateway.emitQuoteUpdated({
        scope: 'historical:cedears',
        updatedCount: cedears,
        refreshedAt: new Date().toISOString(),
      });
      this.marketGateway.emitQuoteUpdated({
        scope: 'historical:bonds',
        updatedCount: bonds,
        refreshedAt: new Date().toISOString(),
      });

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `Historical consolidation completed in ${durationMs}ms (stocks=${stocks}, cedears=${cedears}, bonds=${bonds})`,
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
