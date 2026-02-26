import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { TradeService } from '../../../../application/TradeService';
import { Trade } from '../../../../domain/entities/Trade';
import { RecordTradeRequest } from './request/RecordTradeRequest';

interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
    };
}

@ApiTags('Trade')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trades')
export class TradeController {
    constructor(private readonly tradeService: TradeService) { }

    @Post('portfolio/:portfolioId')
    @ApiOperation({ summary: 'Record trade in portfolio' })
    @ApiParam({ name: 'portfolioId' })
    @ApiResponse({ status: 201 })
    public async recordTrade(
        @Req() req: AuthenticatedRequest,
        @Param('portfolioId') portfolioId: string,
        @Body() payload: RecordTradeRequest,
    ): Promise<Trade> {
        return this.tradeService.recordTrade({
            userId: req.user.sub,
            portfolioId,
            ticker: payload.ticker,
            tradeType: payload.tradeType,
            quantity: payload.quantity,
            pricePerUnit: payload.pricePerUnit,
            currency: payload.currency,
            ...(payload.commission !== undefined ? { commission: payload.commission } : {}),
        });
    }

    @Get('portfolio/:portfolioId')
    @ApiOperation({ summary: 'Get trade history for portfolio' })
    @ApiParam({ name: 'portfolioId' })
    @ApiResponse({ status: 200 })
    public async getTradeHistory(@Param('portfolioId') portfolioId: string): Promise<Trade[]> {
        return this.tradeService.getTradeHistory(portfolioId);
    }
}
