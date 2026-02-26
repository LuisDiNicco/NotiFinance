export class MarketQuote {
  public id?: string;
  public readonly assetId: string | undefined;
  public readonly priceArs: number | null;
  public readonly priceUsd: number | null;
  public readonly openPrice: number | null;
  public readonly highPrice: number | null;
  public readonly lowPrice: number | null;
  public readonly closePrice: number | null;
  public readonly volume: number | null;
  public readonly changePct: number | null;
  public readonly date: Date;

  constructor(
    date: Date,
    {
      assetId,
      priceArs = null,
      priceUsd = null,
      openPrice = null,
      highPrice = null,
      lowPrice = null,
      closePrice = null,
      volume = null,
      changePct = null,
    }: {
      assetId?: string;
      priceArs?: number | null;
      priceUsd?: number | null;
      openPrice?: number | null;
      highPrice?: number | null;
      lowPrice?: number | null;
      closePrice?: number | null;
      volume?: number | null;
      changePct?: number | null;
    },
  ) {
    this.assetId = assetId;
    this.priceArs = priceArs;
    this.priceUsd = priceUsd;
    this.openPrice = openPrice;
    this.highPrice = highPrice;
    this.lowPrice = lowPrice;
    this.closePrice = closePrice;
    this.volume = volume;
    this.changePct = changePct;
    this.date = date;
  }

  public withAssetId(assetId: string): MarketQuote {
    return new MarketQuote(this.date, {
      assetId,
      priceArs: this.priceArs,
      priceUsd: this.priceUsd,
      openPrice: this.openPrice,
      highPrice: this.highPrice,
      lowPrice: this.lowPrice,
      closePrice: this.closePrice,
      volume: this.volume,
      changePct: this.changePct,
    });
  }
}
