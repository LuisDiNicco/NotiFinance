export class AssetNotFoundError extends Error {
    constructor(ticker: string) {
        super(`Asset not found: ${ticker}`);
        this.name = 'AssetNotFoundError';
    }
}
