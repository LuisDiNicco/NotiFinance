import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketDataService } from '../../../../application/MarketDataService';
import { Asset } from '../../../../domain/entities/Asset';
import { MarketQuote } from '../../../../domain/entities/MarketQuote';
import { AssetListQueryRequest } from './request/AssetListQueryRequest';
import { AssetQuotesQueryRequest } from './request/AssetQuotesQueryRequest';

@ApiTags('Assets')
@Controller('assets')
export class AssetController {
    constructor(private readonly marketDataService: MarketDataService) { }

    @Get()
    @ApiOperation({ summary: 'Get asset catalog by optional type' })
    @ApiResponse({ status: 200 })
    public async getAssets(@Query() query: AssetListQueryRequest): Promise<Asset[]> {
        const assets = await this.marketDataService.getAssets(query.type);

        if (!query.limit) {
            return assets;
        }

        return assets.slice(0, query.limit);
    }

    @Get(':ticker')
    @ApiOperation({ summary: 'Get a single asset by ticker' })
    @ApiParam({ name: 'ticker', example: 'GGAL' })
    @ApiResponse({ status: 200 })
    public async getAssetByTicker(@Param('ticker') ticker: string): Promise<Asset> {
        return this.marketDataService.getAssetByTicker(ticker);
    }

    @Get(':ticker/quotes')
    @ApiOperation({ summary: 'Get historical quotes for an asset ticker' })
    @ApiParam({ name: 'ticker', example: 'GGAL' })
    @ApiResponse({ status: 200 })
    public async getAssetQuotes(
        @Param('ticker') ticker: string,
        @Query() query: AssetQuotesQueryRequest,
    ): Promise<MarketQuote[]> {
        return this.marketDataService.getAssetQuotes(ticker, query.days ?? 30);
    }
}
