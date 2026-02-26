import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketDataModule } from '../market-data/market-data.module';
import { PORTFOLIO_REPOSITORY } from './application/IPortfolioRepository';
import { TRADE_REPOSITORY } from './application/ITradeRepository';
import { PortfolioService } from './application/PortfolioService';
import { TradeService } from './application/TradeService';
import { HoldingsCalculator } from './application/HoldingsCalculator';
import { PortfolioController } from './infrastructure/primary-adapters/http/controllers/PortfolioController';
import { TradeController } from './infrastructure/primary-adapters/http/controllers/TradeController';
import { PortfolioEntity } from './infrastructure/secondary-adapters/database/entities/PortfolioEntity';
import { TradeEntity } from './infrastructure/secondary-adapters/database/entities/TradeEntity';
import { TypeOrmPortfolioRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmPortfolioRepository';
import { TypeOrmTradeRepository } from './infrastructure/secondary-adapters/database/repositories/TypeOrmTradeRepository';

@Module({
    imports: [TypeOrmModule.forFeature([PortfolioEntity, TradeEntity]), MarketDataModule],
    controllers: [PortfolioController, TradeController],
    providers: [
        PortfolioService,
        TradeService,
        HoldingsCalculator,
        {
            provide: PORTFOLIO_REPOSITORY,
            useClass: TypeOrmPortfolioRepository,
        },
        {
            provide: TRADE_REPOSITORY,
            useClass: TypeOrmTradeRepository,
        },
    ],
    exports: [PortfolioService, TradeService],
})
export class PortfolioModule { }
