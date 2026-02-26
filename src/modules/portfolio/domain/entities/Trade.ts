import { TradeType } from '../enums/TradeType';

export class Trade {
    public id?: string;
    public readonly portfolioId: string;
    public readonly assetId: string;
    public readonly tradeType: TradeType;
    public readonly quantity: number;
    public readonly pricePerUnit: number;
    public readonly currency: string;
    public readonly commission: number;
    public readonly executedAt: Date;

    constructor(params: {
        portfolioId: string;
        assetId: string;
        tradeType: TradeType;
        quantity: number;
        pricePerUnit: number;
        currency: string;
        commission?: number;
        executedAt?: Date;
    }) {
        this.portfolioId = params.portfolioId;
        this.assetId = params.assetId;
        this.tradeType = params.tradeType;
        this.quantity = params.quantity;
        this.pricePerUnit = params.pricePerUnit;
        this.currency = params.currency;
        this.commission = params.commission ?? 0;
        this.executedAt = params.executedAt ?? new Date();
    }
}
