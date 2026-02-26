import { Injectable } from '@nestjs/common';
import { Holding } from '../domain/entities/Holding';
import { Trade } from '../domain/entities/Trade';
import { TradeType } from '../domain/enums/TradeType';

interface Lot {
    quantity: number;
    unitCost: number;
}

@Injectable()
export class HoldingsCalculator {
    public calculateHoldings(
        trades: Trade[],
        currentPrices: Map<string, number>,
        tickersByAssetId: Map<string, string>,
    ): Holding[] {
        const tradesAsc = [...trades].sort((a, b) => a.executedAt.getTime() - b.executedAt.getTime());
        const lotsByAsset = new Map<string, Lot[]>();

        for (const trade of tradesAsc) {
            const lots = lotsByAsset.get(trade.assetId) ?? [];

            if (trade.tradeType === TradeType.BUY) {
                lots.push({
                    quantity: trade.quantity,
                    unitCost: trade.pricePerUnit + (trade.commission / Math.max(trade.quantity, 1e-9)),
                });
                lotsByAsset.set(trade.assetId, lots);
                continue;
            }

            let remaining = trade.quantity;
            while (remaining > 0 && lots.length > 0) {
                const head = lots[0]!;
                const consumed = Math.min(remaining, head.quantity);
                head.quantity -= consumed;
                remaining -= consumed;

                if (head.quantity <= 0) {
                    lots.shift();
                }
            }

            lotsByAsset.set(trade.assetId, lots);
        }

        const preliminary: Array<Omit<Holding, 'weight'> & { weight?: number }> = [];
        let totalMarketValue = 0;

        for (const [assetId, lots] of lotsByAsset.entries()) {
            const quantity = lots.reduce((acc, lot) => acc + lot.quantity, 0);
            if (quantity <= 0) {
                continue;
            }

            const costBasis = lots.reduce((acc, lot) => acc + lot.quantity * lot.unitCost, 0);
            const avgCostBasis = costBasis / quantity;
            const currentPrice = currentPrices.get(assetId) ?? avgCostBasis;
            const marketValue = quantity * currentPrice;
            const unrealizedPnl = marketValue - costBasis;
            const unrealizedPnlPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

            totalMarketValue += marketValue;
            preliminary.push({
                assetId,
                ticker: tickersByAssetId.get(assetId) ?? assetId,
                quantity,
                avgCostBasis,
                currentPrice,
                marketValue,
                costBasis,
                unrealizedPnl,
                unrealizedPnlPct,
            });
        }

        return preliminary.map(
            (item) =>
                new Holding({
                    ...item,
                    weight: totalMarketValue > 0 ? (item.marketValue / totalMarketValue) * 100 : 0,
                }),
        );
    }
}
