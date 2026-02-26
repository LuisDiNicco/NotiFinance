import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
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
import { WatchlistService } from '../../../../application/WatchlistService';
import { WatchlistItem } from '../../../../domain/entities/WatchlistItem';
import { AddWatchlistItemRequest } from './request/AddWatchlistItemRequest';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('Watchlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Throttle({ authenticated: { limit: 300, ttl: 60000 } })
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get authenticated user watchlist' })
  @ApiResponse({ status: 200 })
  public async getWatchlist(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ data: WatchlistItem[] }> {
    return { data: await this.watchlistService.getUserWatchlist(req.user.sub) };
  }

  @Post()
  @ApiOperation({ summary: 'Add ticker to authenticated user watchlist' })
  @ApiResponse({ status: 201 })
  public async addToWatchlist(
    @Req() req: AuthenticatedRequest,
    @Body() payload: AddWatchlistItemRequest,
  ): Promise<WatchlistItem> {
    return this.watchlistService.addToWatchlist(req.user.sub, payload.ticker);
  }

  @Delete(':ticker')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove ticker from authenticated user watchlist' })
  @ApiParam({ name: 'ticker', example: 'GGAL' })
  @ApiResponse({ status: 204 })
  public async removeFromWatchlist(
    @Req() req: AuthenticatedRequest,
    @Param('ticker') ticker: string,
  ): Promise<void> {
    await this.watchlistService.removeFromWatchlist(req.user.sub, ticker);
  }
}
