import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DOLLAR_QUOTE_REPOSITORY,
  type IDollarQuoteRepository,
} from './IDollarQuoteRepository';
import { ProviderOrchestrator } from './ProviderOrchestrator';
import { DollarQuote } from '../domain/entities/DollarQuote';
import { DollarType } from '../domain/enums/DollarType';
import { AssetType } from '../domain/enums/AssetType';

export interface MEPCCLValidationResult {
  type: DollarType.MEP | DollarType.CCL;
  calculated: number;
  reference: number;
  referenceSource: string;
  deviationPct: number;
}

export interface MEPCCLCalculationResult {
  quotes: DollarQuote[];
  validations: MEPCCLValidationResult[];
}

@Injectable()
export class MEPCCLCalculationService {
  private readonly logger = new Logger(MEPCCLCalculationService.name);
  private readonly mepArsTicker: string;
  private readonly mepUsdTicker: string;
  private readonly cclArsTicker: string;
  private readonly cclUsdTicker: string;
  private readonly validationThresholdPct: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly providerOrchestrator: ProviderOrchestrator,
    @Inject(DOLLAR_QUOTE_REPOSITORY)
    private readonly dollarQuoteRepository: IDollarQuoteRepository,
  ) {
    this.mepArsTicker = this.configService.get<string>(
      'market.mep.arsTicker',
      'AL30.BA',
    );
    this.mepUsdTicker = this.configService.get<string>(
      'market.mep.usdTicker',
      'AL30D.BA',
    );
    this.cclArsTicker = this.configService.get<string>(
      'market.ccl.arsTicker',
      'GD30.BA',
    );
    this.cclUsdTicker = this.configService.get<string>(
      'market.ccl.usdTicker',
      'GD30',
    );
    this.validationThresholdPct = this.configService.get<number>(
      'market.mepCcl.validationThresholdPct',
      2,
    );
  }

  public async calculateAndPersist(): Promise<MEPCCLCalculationResult> {
    const now = new Date();

    const [mepArsPrice, mepUsdPrice, cclArsPrice, cclUsdPrice] =
      await Promise.all([
        this.fetchBondPrice(this.mepArsTicker),
        this.fetchBondPrice(this.mepUsdTicker),
        this.fetchBondPrice(this.cclArsTicker),
        this.fetchBondPrice(this.cclUsdTicker),
      ]);

    const mep = this.safeDivide(mepArsPrice, mepUsdPrice);
    const ccl = this.safeDivide(cclArsPrice, cclUsdPrice);

    if (mep == null || ccl == null) {
      throw new Error('Unable to calculate MEP/CCL due to invalid bond prices');
    }

    const calculatedQuotes = [
      new DollarQuote(
        DollarType.DOLLAR_MEP_CALC,
        this.roundTo(mep, 4),
        this.roundTo(mep, 4),
        now,
        'bond-parity-calc',
      ),
      new DollarQuote(
        DollarType.DOLLAR_CCL_CALC,
        this.roundTo(ccl, 4),
        this.roundTo(ccl, 4),
        now,
        'bond-parity-calc',
      ),
    ];

    await this.dollarQuoteRepository.saveMany(calculatedQuotes);

    const validations = await this.crossValidate({
      mep: calculatedQuotes[0]!,
      ccl: calculatedQuotes[1]!,
    });

    return {
      quotes: calculatedQuotes,
      validations,
    };
  }

  private async fetchBondPrice(yahooTicker: string): Promise<number> {
    const orchestrated = await this.providerOrchestrator.fetchQuote(
      AssetType.BOND,
      yahooTicker,
    );

    const price = this.pickPrice(orchestrated.quote);
    if (price == null || price <= 0) {
      throw new Error(`Invalid price for ${yahooTicker}`);
    }

    return price;
  }

  private async crossValidate(values: {
    mep: DollarQuote;
    ccl: DollarQuote;
  }): Promise<MEPCCLValidationResult[]> {
    const externalQuotes = await this.dollarQuoteRepository.findLatestByType();

    const references: Array<{
      type: DollarType.MEP | DollarType.CCL;
      calculated: number;
      quote: DollarQuote | undefined;
    }> = [
      {
        type: DollarType.MEP,
        calculated: values.mep.sellPrice,
        quote: externalQuotes.find((quote) => quote.type === DollarType.MEP),
      },
      {
        type: DollarType.CCL,
        calculated: values.ccl.sellPrice,
        quote: externalQuotes.find((quote) => quote.type === DollarType.CCL),
      },
    ];

    const results = references
      .map((reference) => {
        const quote = reference.quote;
        if (!quote || quote.sellPrice <= 0) {
          return null;
        }

        const deviationPct =
          ((reference.calculated - quote.sellPrice) / quote.sellPrice) * 100;

        if (Math.abs(deviationPct) > this.validationThresholdPct) {
          this.logger.warn(
            `${reference.type} calc deviation ${deviationPct.toFixed(2)}% vs ${quote.source} (${quote.sellPrice.toFixed(4)})`,
          );
        }

        return {
          type: reference.type,
          calculated: this.roundTo(reference.calculated, 4),
          reference: this.roundTo(quote.sellPrice, 4),
          referenceSource: quote.source,
          deviationPct: this.roundTo(deviationPct, 4),
        };
      })
      .filter((result): result is MEPCCLValidationResult => result !== null);

    return results;
  }

  private pickPrice(quote: {
    closePrice: number | null;
    priceArs: number | null;
    priceUsd: number | null;
  }): number | null {
    if (typeof quote.closePrice === 'number') {
      return quote.closePrice;
    }

    if (typeof quote.priceArs === 'number') {
      return quote.priceArs;
    }

    if (typeof quote.priceUsd === 'number') {
      return quote.priceUsd;
    }

    return null;
  }

  private safeDivide(numerator: number, denominator: number): number | null {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      return null;
    }

    if (denominator <= 0) {
      return null;
    }

    return numerator / denominator;
  }

  private roundTo(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
}
