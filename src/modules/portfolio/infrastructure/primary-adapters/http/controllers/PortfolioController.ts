import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { PortfolioService } from '../../../../application/PortfolioService';
import { TradeService } from '../../../../application/TradeService';
import { Portfolio } from '../../../../domain/entities/Portfolio';
import { Trade } from '../../../../domain/entities/Trade';
import { CreatePortfolioRequest } from './request/CreatePortfolioRequest';
import { RecordTradeRequest } from './request/RecordTradeRequest';

interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
    };
}

@ApiTags('portfolios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('portfolios')
export class PortfolioController {
    constructor(
        private readonly portfolioService: PortfolioService,
        private readonly tradeService: TradeService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create portfolio' })
    @ApiResponse({ status: 201 })
    public async createPortfolio(
        @Req() req: AuthenticatedRequest,
        @Body() payload: CreatePortfolioRequest,
    ): Promise<Portfolio> {
        return this.portfolioService.createPortfolio(req.user.sub, payload.name, payload.description);
    }

    @Get()
    @ApiOperation({ summary: 'Get user portfolios' })
    @ApiResponse({ status: 200 })
    public async getUserPortfolios(@Req() req: AuthenticatedRequest): Promise<Portfolio[]> {
        return this.portfolioService.getUserPortfolios(req.user.sub);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get portfolio detail' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200 })
    public async getPortfolio(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<Portfolio | null> {
        return this.portfolioService.getPortfolioDetail(req.user.sub, id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete portfolio' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200 })
    public async deletePortfolio(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
        await this.portfolioService.deletePortfolio(req.user.sub, id);
    }

    @Post(':id/trades')
    @ApiOperation({ summary: 'Record trade in portfolio' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 201 })
    public async recordTrade(@Param('id') id: string, @Body() payload: RecordTradeRequest): Promise<Trade> {
        const tradeInput = {
            portfolioId: id,
            ticker: payload.ticker,
            tradeType: payload.tradeType,
            quantity: payload.quantity,
            pricePerUnit: payload.pricePerUnit,
            currency: payload.currency,
            ...(payload.commission !== undefined ? { commission: payload.commission } : {}),
        };

        return this.tradeService.recordTrade({
            ...tradeInput,
        });
    }

    @Get(':id/trades')
    @ApiOperation({ summary: 'Get trade history for portfolio' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200 })
    public async getTradeHistory(@Param('id') id: string): Promise<Trade[]> {
        return this.tradeService.getTradeHistory(id);
    }
}
