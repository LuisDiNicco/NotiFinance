import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketDataService } from '../../../../application/MarketDataService';
import { DollarQuote } from '../../../../domain/entities/DollarQuote';
import { CountryRisk } from '../../../../domain/entities/CountryRisk';
import { MarketQuote } from '../../../../domain/entities/MarketQuote';
import { Asset } from '../../../../domain/entities/Asset';
import { TopMoversQueryRequest } from './request/TopMoversQueryRequest';
import { Query } from '@nestjs/common';

@ApiTags('Market')
@Controller('market')
export class MarketController {
    constructor(private readonly marketDataService: MarketDataService) { }

    @Get('dollar')
    @ApiOperation({ summary: 'Get all dollar quotes' })
    @ApiResponse({ status: 200 })
    public async getDollarQuotes(): Promise<DollarQuote[]> {
        return this.marketDataService.getDollarQuotes();
    }

    @Get('risk')
    @ApiOperation({ summary: 'Get current country risk' })
    @ApiResponse({ status: 200 })
    public async getCountryRisk(): Promise<CountryRisk> {
        return this.marketDataService.getCountryRisk();
    }

    @Get('summary')
    @ApiOperation({ summary: 'Get market summary' })
    @ApiResponse({ status: 200 })
    public async getMarketSummary(): Promise<{ dollar: DollarQuote[]; risk: CountryRisk; }> {
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
