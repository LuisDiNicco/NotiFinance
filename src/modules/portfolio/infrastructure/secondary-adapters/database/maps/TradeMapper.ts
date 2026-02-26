import { Trade } from '../../../../domain/entities/Trade';
import { TradeType } from '../../../../domain/enums/TradeType';
import { TradeEntity } from '../entities/TradeEntity';

export class TradeMapper {
    public static toDomain(entity: TradeEntity): Trade {
        const trade = new Trade({
            portfolioId: entity.portfolioId,
            assetId: entity.assetId,
            tradeType: entity.tradeType as TradeType,
            quantity: Number(entity.quantity),
            pricePerUnit: Number(entity.pricePerUnit),
            currency: entity.currency,
            commission: Number(entity.commission),
            executedAt: entity.executedAt,
        });

        trade.id = entity.id;
        return trade;
    }

    public static toPersistence(domain: Trade): TradeEntity {
        const entity = new TradeEntity();
        if (domain.id) {
            entity.id = domain.id;
        }

        entity.portfolioId = domain.portfolioId;
        entity.assetId = domain.assetId;
        entity.tradeType = domain.tradeType;
        entity.quantity = domain.quantity;
        entity.pricePerUnit = domain.pricePerUnit;
        entity.currency = domain.currency;
        entity.commission = domain.commission;
        entity.executedAt = domain.executedAt;
        return entity;
    }
}
