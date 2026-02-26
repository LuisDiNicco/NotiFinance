import { DollarType } from '../enums/DollarType';

export class DollarQuote {
    public readonly type: DollarType;
    public readonly buyPrice: number;
    public readonly sellPrice: number;
    public readonly timestamp: Date;
    public readonly source: string;

    constructor(type: DollarType, buyPrice: number, sellPrice: number, timestamp: Date, source: string) {
        this.type = type;
        this.buyPrice = buyPrice;
        this.sellPrice = sellPrice;
        this.timestamp = timestamp;
        this.source = source;
    }
}
