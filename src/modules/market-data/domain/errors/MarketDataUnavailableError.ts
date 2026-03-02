export class MarketDataUnavailableError extends Error {
  constructor(ticker: string) {
    super(`Market data is temporarily unavailable for asset ${ticker}`);
    this.name = 'MarketDataUnavailableError';
  }
}
