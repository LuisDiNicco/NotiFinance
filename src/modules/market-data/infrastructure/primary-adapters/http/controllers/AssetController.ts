import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketDataService } from '../../../../application/MarketDataService';
import { Asset } from '../../../../domain/entities/Asset';
import { MarketQuote } from '../../../../domain/entities/MarketQuote';
import { AssetListQueryRequest } from './request/AssetListQueryRequest';
import { AssetQuotesQueryRequest } from './request/AssetQuotesQueryRequest';
import { RelatedAssetsQueryRequest } from './request/RelatedAssetsQueryRequest';

@ApiTags('Assets')
@Controller('assets')
export class AssetController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get()
  @ApiOperation({ summary: 'Get asset catalog by optional type' })
  @ApiResponse({ status: 200 })
  public async getAssets(
    @Query() query: AssetListQueryRequest,
  ): Promise<Asset[]> {
    const assets = await this.marketDataService.getAssets(query.type);

    if (!query.limit) {
      return assets;
    }

    return assets.slice(0, query.limit);
  }

  @Get('top/gainers')
  @ApiOperation({ summary: 'Get top gainers by asset type' })
  @ApiResponse({ status: 200 })
  public async getTopGainers(
    @Query() query: AssetListQueryRequest,
  ): Promise<Asset[]> {
    return this.marketDataService.getTopGainers(query.type, query.limit ?? 5);
  }

  @Get('top/losers')
  @ApiOperation({ summary: 'Get top losers by asset type' })
  @ApiResponse({ status: 200 })
  public async getTopLosers(
    @Query() query: AssetListQueryRequest,
  ): Promise<Asset[]> {
    return this.marketDataService.getTopLosers(query.type, query.limit ?? 5);
  }

  @Get(':ticker')
  @ApiOperation({ summary: 'Get a single asset by ticker' })
  @ApiParam({ name: 'ticker', example: 'GGAL' })
  @ApiResponse({ status: 200 })
  public async getAssetByTicker(
    @Param('ticker') ticker: string,
  ): Promise<Asset> {
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

  @Get(':ticker/stats')
  @ApiOperation({ summary: 'Get aggregated quote stats for an asset ticker' })
  @ApiParam({ name: 'ticker', example: 'GGAL' })
  @ApiResponse({ status: 200 })
  public async getAssetStats(
    @Param('ticker') ticker: string,
    @Query() query: AssetQuotesQueryRequest,
  ): Promise<{
    ticker: string;
    points: number;
    minClose: number;
    maxClose: number;
    latestClose: number;
    changePctFromPeriodStart: number;
  }> {
    return this.marketDataService.getAssetStats(ticker, query.days ?? 30);
  }

  @Get(':ticker/related')
  @ApiOperation({ summary: 'Get related assets by same asset type' })
  @ApiParam({ name: 'ticker', example: 'GGAL' })
  @ApiResponse({ status: 200 })
  public async getRelatedAssets(
    @Param('ticker') ticker: string,
    @Query() query: RelatedAssetsQueryRequest,
  ): Promise<Asset[]> {
    return this.marketDataService.getRelatedAssets(ticker, query.limit ?? 5);
  }
}
