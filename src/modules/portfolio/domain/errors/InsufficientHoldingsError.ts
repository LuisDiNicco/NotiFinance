export class InsufficientHoldingsError extends Error {
  constructor(assetId: string, available: number, requested: number) {
    super(
      `Insufficient holdings for asset ${assetId}. Available: ${available}, requested: ${requested}`,
    );
    this.name = 'InsufficientHoldingsError';
  }
}
