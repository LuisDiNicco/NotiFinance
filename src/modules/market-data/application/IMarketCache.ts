export const MARKET_CACHE = 'IMarketCache';

export interface IMarketCache {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, expireInSeconds: number): Promise<void>;
}
