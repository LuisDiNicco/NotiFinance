import { Holding } from '../../../../../../src/modules/portfolio/domain/entities/Holding';

describe('Holding value object', () => {
  it('maps constructor params to readonly fields', () => {
    const holding = new Holding({
      assetId: 'asset-1',
      ticker: 'GGAL',
      quantity: 10,
      avgCostBasis: 1000,
      currentPrice: 1100,
      marketValue: 11000,
      costBasis: 10000,
      unrealizedPnl: 1000,
      unrealizedPnlPct: 10,
      weight: 55,
    });

    expect(holding.assetId).toBe('asset-1');
    expect(holding.ticker).toBe('GGAL');
    expect(holding.quantity).toBe(10);
    expect(holding.unrealizedPnlPct).toBe(10);
    expect(holding.weight).toBe(55);
  });
});
