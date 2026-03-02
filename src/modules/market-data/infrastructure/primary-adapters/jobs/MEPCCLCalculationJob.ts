import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MEPCCLCalculationService } from '../../../application/MEPCCLCalculationService';
import { MarketGateway } from '../../secondary-adapters/websockets/MarketGateway';
import { MarketDataService } from '../../../application/MarketDataService';

@Injectable()
export class MEPCCLCalculationJob {
  private readonly logger = new Logger(MEPCCLCalculationJob.name);

  constructor(
    private readonly mepCclCalculationService: MEPCCLCalculationService,
    private readonly marketDataService: MarketDataService,
    private readonly marketGateway: MarketGateway,
  ) {}

  @Cron('*/5 10-17 * * 1-5')
  public async handle(): Promise<void> {
    const startedAt = Date.now();

    try {
      const result = await this.mepCclCalculationService.calculateAndPersist();
      this.marketGateway.emitDollar(result.quotes);

      const status = await this.marketDataService.getMarketStatus();
      this.marketGateway.emitMarketStatus({
        isOpen: status.marketOpen,
        phase: status.marketOpen ? 'OPEN' : 'CLOSED',
      });

      const durationMs = Date.now() - startedAt;
      this.logger.log(
        `MEP/CCL calculated and published (${result.quotes.length} quotes) in ${durationMs}ms`,
      );
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      this.logger.error(
        `MEP/CCL calculation failed after ${durationMs}ms`,
        error as Error,
      );
    }
  }
}
