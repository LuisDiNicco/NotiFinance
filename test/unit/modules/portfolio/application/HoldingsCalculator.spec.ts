import { HoldingsCalculator } from '../../../../../src/modules/portfolio/application/HoldingsCalculator';
import { Trade } from '../../../../../src/modules/portfolio/domain/entities/Trade';
import { TradeType } from '../../../../../src/modules/portfolio/domain/enums/TradeType';

describe('HoldingsCalculator', () => {
    let calculator: HoldingsCalculator;

    beforeEach(() => {
        calculator = new HoldingsCalculator();
    });

    it('calculates holdings using FIFO after buy and sell operations', () => {
        const trades = [
            new Trade({
                portfolioId: 'portfolio-1',
                assetId: 'asset-1',
                tradeType: TradeType.BUY,
                quantity: 10,
                pricePerUnit: 100,
                currency: 'USD',
                executedAt: new Date('2026-01-01T10:00:00Z'),
            }),
            new Trade({
                portfolioId: 'portfolio-1',
                assetId: 'asset-1',
                tradeType: TradeType.BUY,
                quantity: 5,
                pricePerUnit: 120,
                currency: 'USD',
                executedAt: new Date('2026-01-02T10:00:00Z'),
            }),
            new Trade({
                portfolioId: 'portfolio-1',
                assetId: 'asset-1',
                tradeType: TradeType.SELL,
                quantity: 8,
                pricePerUnit: 130,
                currency: 'USD',
                executedAt: new Date('2026-01-03T10:00:00Z'),
            }),
        ];

        const result = calculator.calculateHoldings(
            trades,
            new Map([['asset-1', 150]]),
            new Map([['asset-1', 'GGAL']]),
        );

        expect(result).toHaveLength(1);
        expect(result[0]?.ticker).toBe('GGAL');
        expect(result[0]?.quantity).toBe(7);
        expect(result[0]?.costBasis).toBeCloseTo(800);
        expect(result[0]?.marketValue).toBeCloseTo(1050);
        expect(result[0]?.unrealizedPnl).toBeCloseTo(250);
    });

    it('calculates distribution weights summing to 100%', () => {
        const trades = [
            new Trade({
                portfolioId: 'portfolio-1',
                assetId: 'asset-1',
                tradeType: TradeType.BUY,
                quantity: 10,
                pricePerUnit: 100,
                currency: 'USD',
            }),
            new Trade({
                portfolioId: 'portfolio-1',
                assetId: 'asset-2',
                tradeType: TradeType.BUY,
                quantity: 5,
                pricePerUnit: 200,
                currency: 'USD',
            }),
        ];

        const result = calculator.calculateHoldings(
            trades,
            new Map([
                ['asset-1', 110],
                ['asset-2', 210],
            ]),
            new Map([
                ['asset-1', 'GGAL'],
                ['asset-2', 'YPFD'],
            ]),
        );

        const totalWeight = result.reduce((acc, holding) => acc + holding.weight, 0);
        expect(result).toHaveLength(2);
        expect(totalWeight).toBeCloseTo(100, 5);
    });
});
