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
  public async getUserPortfolios(@Req() req: AuthenticatedRequest): Promise<{
    data: Array<
      Portfolio & {
        summary: {
          totalValueArs: number;
          totalCostArs: number;
          unrealizedPnl: number;
          unrealizedPnlPct: number;
          holdingsCount: number;
        };
      }
    >;
  }> {
    const portfolios = await this.portfolioService.getUserPortfolios(
      req.user.sub,
    );
    const data = await Promise.all(
      portfolios.map(async (portfolio) => {
        const holdings = portfolio.id
          ? await this.portfolioService.getPortfolioHoldings(
              req.user.sub,
              portfolio.id,
            )
          : [];

        const totalValueArs = holdings.reduce(
          (acc, holding) => acc + holding.marketValue,
          0,
        );
        const totalCostArs = holdings.reduce(
          (acc, holding) => acc + holding.costBasis,
          0,
        );
        const unrealizedPnl = totalValueArs - totalCostArs;
        const unrealizedPnlPct =
          totalCostArs > 0 ? (unrealizedPnl / totalCostArs) * 100 : 0;

        return {
          ...portfolio,
          summary: {
            totalValueArs,
            totalCostArs,
            unrealizedPnl,
            unrealizedPnlPct,
            holdingsCount: holdings.length,
          },
        };
      }),
    );

    return { data };
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
  ): Promise<{
    portfolioId: string;
    totalValueArs: number;
    totalCostArs: number;
    unrealizedPnl: number;
    unrealizedPnlPct: number;
    holdings: Holding[];
  }> {
    const holdings = await this.portfolioService.getPortfolioHoldings(
      req.user.sub,
      id,
    );
    const totalValueArs = holdings.reduce(
      (acc, holding) => acc + holding.marketValue,
      0,
    );
    const totalCostArs = holdings.reduce(
      (acc, holding) => acc + holding.costBasis,
      0,
    );
    const unrealizedPnl = totalValueArs - totalCostArs;
    const unrealizedPnlPct =
      totalCostArs > 0 ? (unrealizedPnl / totalCostArs) * 100 : 0;

    return {
      portfolioId: id,
      totalValueArs,
      totalCostArs,
      unrealizedPnl,
      unrealizedPnlPct,
      holdings,
    };
  }

  @Get(':id/distribution')
  @ApiOperation({ summary: 'Get holdings distribution by ticker' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async getDistribution(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{
    byAsset: Array<{ ticker: string; value: number; weight: number }>;
    byType: Array<{ type: string; value: number; weight: number }>;
    bySector: Array<{ sector: string; value: number; weight: number }>;
    byCurrency: Array<{ currency: string; value: number; weight: number }>;
  }> {
    return this.portfolioService.getPortfolioDistribution(req.user.sub, id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get portfolio performance by period' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async getPerformance(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Query('period') period = '3M',
  ): Promise<{
    portfolioId: string;
    period: string;
    startValue: number;
    endValue: number;
    totalReturn: number;
    dataPoints: Array<{ date: string; value: number }>;
    benchmarks: {
      merval: { startValue: number; endValue: number; return: number };
      dollarMep: { startValue: number; endValue: number; return: number };
    };
  }> {
    const performance = await this.portfolioService.getPortfolioPerformance(
      req.user.sub,
      id,
      period,
    );

    const startValue = performance.points[0]?.value ?? 0;
    const endValue = performance.points.at(-1)?.value ?? startValue;
    const totalReturn =
      startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;

    return {
      portfolioId: id,
      period: performance.period,
      startValue,
      endValue,
      totalReturn,
      dataPoints: performance.points,
      benchmarks: {
        merval: { startValue: 100, endValue: 100, return: 0 },
        dollarMep: { startValue: 100, endValue: 100, return: 0 },
      },
    };
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
