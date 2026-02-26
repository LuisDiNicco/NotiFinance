import { BadRequestException, Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketDataService } from '../../../../application/MarketDataService';
import { DollarQuote } from '../../../../domain/entities/DollarQuote';
import { CountryRisk } from '../../../../domain/entities/CountryRisk';
import { MarketQuote } from '../../../../domain/entities/MarketQuote';
import { Asset } from '../../../../domain/entities/Asset';
import { TopMoversQueryRequest } from './request/TopMoversQueryRequest';
import { Param, Query } from '@nestjs/common';
import { DollarType } from '../../../../domain/enums/DollarType';
import { MarketHistoryQueryRequest } from './request/MarketHistoryQueryRequest';

@ApiTags('Market')
@Controller('market')
export class MarketController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('dollar')
  @ApiOperation({ summary: 'Get all dollar quotes' })
  @ApiResponse({ status: 200 })
  public async getDollarQuotes(): Promise<DollarQuote[]> {
    return this.marketDataService.getDollarQuotes();
  }

  @Get('dollar/:type')
  @ApiOperation({ summary: 'Get latest quote for a dollar type' })
  @ApiParam({ name: 'type', enum: DollarType })
  @ApiResponse({ status: 200 })
  public async getDollarQuoteByType(
    @Param('type') type: DollarType,
  ): Promise<DollarQuote | null> {
    const quotes = await this.marketDataService.getDollarQuotes();
    return quotes.find((quote) => quote.type === type) ?? null;
  }

  @Get('dollar/history/:type')
  @ApiOperation({ summary: 'Get historical quotes for a dollar type' })
  @ApiParam({ name: 'type', enum: DollarType })
  @ApiResponse({ status: 200 })
  public async getDollarHistory(
    @Param('type') type: DollarType,
    @Query() query: MarketHistoryQueryRequest,
  ): Promise<DollarQuote[]> {
    return this.marketDataService.getDollarHistory(type, query.days ?? 30);
  }

  @Get('dollar/history')
  @ApiOperation({ summary: 'Get historical quotes for a dollar type (query)' })
  @ApiResponse({ status: 200 })
  public async getDollarHistoryByQuery(
    @Query() query: MarketHistoryQueryRequest,
  ): Promise<DollarQuote[]> {
    if (!query.type) {
      throw new BadRequestException(
        'Query parameter "type" is required for dollar history',
      );
    }

    return this.marketDataService.getDollarHistory(
      query.type,
      query.days ?? 30,
    );
  }

  @Get('risk')
  @ApiOperation({ summary: 'Get current country risk' })
  @ApiResponse({ status: 200 })
  public async getCountryRisk(): Promise<CountryRisk> {
    return this.marketDataService.getCountryRisk();
  }

  @Get('risk/history')
  @ApiOperation({ summary: 'Get country risk history' })
  @ApiResponse({ status: 200 })
  public async getCountryRiskHistory(
    @Query() query: MarketHistoryQueryRequest,
  ): Promise<CountryRisk[]> {
    return this.marketDataService.getCountryRiskHistory(query.days ?? 30);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get market summary' })
  @ApiResponse({ status: 200 })
  public async getMarketSummary(): Promise<{
    dollar: DollarQuote[];
    risk: CountryRisk;
    marketStatus: {
      now: string;
      marketOpen: boolean;
      schedules: {
        stocks: string;
        cedears: string;
        bonds: string;
        dollar: string;
        risk: string;
      };
      lastUpdate: {
        dollar: string | null;
        risk: string | null;
        quotes: string | null;
      };
    };
    topMovers: {
      stocks: {
        gainers: Array<{
          ticker: string;
          name: string;
          priceArs: number;
          changePct: number;
        }>;
        losers: Array<{
          ticker: string;
          name: string;
          priceArs: number;
          changePct: number;
        }>;
      };
      cedears: {
        gainers: Array<{
          ticker: string;
          name: string;
          priceArs: number;
          changePct: number;
        }>;
        losers: Array<{
          ticker: string;
          name: string;
          priceArs: number;
          changePct: number;
        }>;
      };
    };
  }> {
    return this.marketDataService.getMarketSummary();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get market data refresh status' })
  @ApiResponse({ status: 200 })
  public async getMarketStatus(): Promise<{
    now: string;
    marketOpen: boolean;
    schedules: {
      stocks: string;
      cedears: string;
      bonds: string;
      dollar: string;
      risk: string;
    };
    lastUpdate: {
      dollar: string | null;
      risk: string | null;
      quotes: string | null;
    };
  }> {
    return this.marketDataService.getMarketStatus();
  }

  @Get('top-movers')
  @ApiOperation({ summary: 'Get top gainers and losers by asset type' })
  @ApiResponse({ status: 200 })
  public async getTopMovers(@Query() query: TopMoversQueryRequest): Promise<{
    gainers: Array<{ asset: Asset; quote: MarketQuote }>;
    losers: Array<{ asset: Asset; quote: MarketQuote }>;
  }> {
    return this.marketDataService.getTopMovers(query.type, query.limit ?? 5);
  }
}
