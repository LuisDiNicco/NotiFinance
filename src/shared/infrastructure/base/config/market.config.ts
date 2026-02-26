import { registerAs } from '@nestjs/config';

export default registerAs('market', () => ({
  dolarApiUrl: process.env['DOLAR_API_URL'] || 'https://dolarapi.com/v1',
  alphaVantageApiKey: process.env['ALPHA_VANTAGE_API_KEY'] || '',
  chunkDelayMs: Number(process.env['MARKET_CHUNK_DELAY_MS'] || 300),
  quoteRetryAttempts: Number(process.env['MARKET_QUOTE_RETRY_ATTEMPTS'] || 3),
  quoteRetryBaseDelayMs: Number(
    process.env['MARKET_QUOTE_RETRY_BASE_DELAY_MS'] || 250,
  ),
  statusCacheTtlSeconds: Number(
    process.env['MARKET_STATUS_CACHE_TTL_SECONDS'] || 30,
  ),
  topMoversCacheTtlSeconds: Number(
    process.env['MARKET_TOP_MOVERS_CACHE_TTL_SECONDS'] || 60,
  ),
}));
