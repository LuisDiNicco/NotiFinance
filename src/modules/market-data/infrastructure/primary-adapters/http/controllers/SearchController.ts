import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MarketDataService } from '../../../../application/MarketDataService';
import { SearchQueryRequest } from './request/SearchQueryRequest';
import { Asset } from '../../../../domain/entities/Asset';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private readonly marketDataService: MarketDataService) { }

    @Get()
    @ApiOperation({ summary: 'Search assets by ticker or name' })
    @ApiResponse({ status: 200 })
    public async search(@Query() query: SearchQueryRequest): Promise<Asset[]> {
        return this.marketDataService.searchAssets(query.q, query.limit ?? 10);
    }
}
