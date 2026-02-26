import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { PaginatedResponse } from '../../../../application/Pagination';
import { PortfolioService } from '../../../../application/PortfolioService';
import { TradeService } from '../../../../application/TradeService';
import { Portfolio } from '../../../../domain/entities/Portfolio';
import { Holding } from '../../../../domain/entities/Holding';
import { Trade } from '../../../../domain/entities/Trade';
import { CreatePortfolioRequest } from './request/CreatePortfolioRequest';
import { RecordTradeRequest } from './request/RecordTradeRequest';
import { TradeHistoryQueryRequest } from './request/TradeHistoryQueryRequest';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('Portfolio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Throttle({ authenticated: { limit: 300, ttl: 60000 } })
@Controller('portfolios')
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly tradeService: TradeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create portfolio' })
  @ApiResponse({ status: 201 })
  public async createPortfolio(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreatePortfolioRequest,
  ): Promise<Portfolio> {
    return this.portfolioService.createPortfolio(
      req.user.sub,
      payload.name,
      payload.description,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get user portfolios' })
  @ApiResponse({ status: 200 })
  public async getUserPortfolios(
    @Req() req: AuthenticatedRequest,
  ): Promise<Portfolio[]> {
    return this.portfolioService.getUserPortfolios(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio detail' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async getPortfolio(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<Portfolio | null> {
    return this.portfolioService.getPortfolioDetail(req.user.sub, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete portfolio' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async deletePortfolio(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await this.portfolioService.deletePortfolio(req.user.sub, id);
  }

  @Get(':id/holdings')
  @ApiOperation({ summary: 'Get calculated holdings for portfolio' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async getHoldings(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<Holding[]> {
    return this.portfolioService.getPortfolioHoldings(req.user.sub, id);
  }

  @Get(':id/distribution')
  @ApiOperation({ summary: 'Get holdings distribution by ticker' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async getDistribution(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<Array<{ ticker: string; weight: number }>> {
    return this.portfolioService.getPortfolioDistribution(req.user.sub, id);
  }

  @Post(':id/trades')
  @ApiOperation({
    summary: 'Record trade in portfolio (legacy compatible route)',
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 201 })
  public async recordTrade(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() payload: RecordTradeRequest,
  ): Promise<Trade> {
    return this.tradeService.recordTrade({
      userId: req.user.sub,
      portfolioId: id,
      ticker: payload.ticker,
      tradeType: payload.tradeType,
      quantity: payload.quantity,
      pricePerUnit: payload.pricePerUnit,
      currency: payload.currency,
      ...(payload.commission !== undefined
        ? { commission: payload.commission }
        : {}),
      ...(payload.executedAt
        ? { executedAt: new Date(payload.executedAt) }
        : {}),
    });
  }

  @Get(':id/trades')
  @ApiOperation({ summary: 'Get trade history (legacy compatible route)' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async getTradeHistory(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query() query: TradeHistoryQueryRequest,
  ): Promise<PaginatedResponse<Trade>> {
    return this.tradeService.getTradeHistory(
      req.user.sub,
      id,
      query.page,
      query.limit,
      query.sortBy,
    );
  }
}
