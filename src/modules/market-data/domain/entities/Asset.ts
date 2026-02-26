import { AssetType } from '../enums/AssetType';

export class Asset {
    public id?: string;
    public readonly ticker: string;
    public readonly name: string;
    public readonly assetType: AssetType;
    public readonly sector: string;
    public readonly yahooTicker: string;

    constructor(
        ticker: string,
        name: string,
        assetType: AssetType,
        sector: string,
        yahooTicker: string,
    ) {
        this.ticker = ticker;
        this.name = name;
        this.assetType = assetType;
        this.sector = sector;
        this.yahooTicker = yahooTicker;
    }
}
