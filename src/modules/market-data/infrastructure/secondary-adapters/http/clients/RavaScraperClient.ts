import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { type IQuoteProvider } from '../../../../application/IQuoteProvider';
import { ProviderHealthTracker } from '../../../../application/ProviderHealthTracker';
import { MarketQuote } from '../../../../domain/entities/MarketQuote';

interface ParsedRavaRow {
  symbol: string;
  closePrice: number;
  changePct: number | null;
  volume: number | null;
}

@Injectable()
export class RavaScraperClient implements IQuoteProvider {
  private static readonly ROBOTS_CACHE_TTL_MS = 15 * 60 * 1000;

  private readonly baseUrl: string;
  private readonly rateLimitMs: number;
  private readonly userAgent: string;

  private lastRequestAt = 0;
  private robotsCache: {
    checkedAt: number;
    disallowedPaths: string[];
  } = {
    checkedAt: 0,
    disallowedPaths: [],
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly providerHealthTracker: ProviderHealthTracker,
  ) {
    this.baseUrl = this.configService.get<string>(
      'market.ravaBaseUrl',
      'https://www.rava.com',
    );
    this.rateLimitMs = this.configService.get<number>(
      'market.scrapingRateLimitMs',
      10000,
    );
    this.userAgent = this.configService.get<string>(
      'market.scrapingUserAgent',
      'NotiFinance/2.0 (educational project)',
    );
  }

  public async fetchQuote(yahooTicker: string): Promise<MarketQuote> {
    const symbol = this.normalizeSymbol(yahooTicker);
    const snapshot = await this.fetchSnapshot();
    const row = snapshot.get(symbol);

    if (!row) {
      throw new Error(`Rava quote not found for symbol ${symbol}`);
    }

    return this.toMarketQuote(row);
  }

  public async fetchHistorical(
    yahooTicker: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MarketQuote[]> {
    void startDate;
    void endDate;

    const latest = await this.fetchQuote(yahooTicker);
    return [latest];
  }

  public async fetchBulkQuotes(yahooTickers: string[]): Promise<MarketQuote[]> {
    const snapshot = await this.fetchSnapshot();

    return yahooTickers
      .map((ticker) => {
        const symbol = this.normalizeSymbol(ticker);
        const row = snapshot.get(symbol);
        return row ? this.toMarketQuote(row) : null;
      })
      .filter((quote): quote is MarketQuote => quote !== null);
  }

  private async fetchSnapshot(): Promise<Map<string, ParsedRavaRow>> {
    const path = '/empresas/cotizaciones';

    await this.ensureRobotsAllows(path);
    await this.waitForRateLimit();

    const response = await this.providerHealthTracker.track(
      'rava.com',
      path,
      () =>
        axios.get<string>(`${this.baseUrl}${path}`, {
          timeout: 8000,
          headers: {
            'User-Agent': this.userAgent,
          },
        }),
    );

    const rows = this.parseRows(response.data);
    if (rows.length === 0) {
      throw new Error('Rava scraper returned no usable rows');
    }

    return new Map(rows.map((row) => [row.symbol, row]));
  }

  private parseRows(html: string): ParsedRavaRow[] {
    const $ = cheerio.load(html);
    const rows: ParsedRavaRow[] = [];

    $('table tbody tr').each((_index, row) => {
      const cells = $(row).find('td');
      const symbol = this.normalizeSymbol($(cells[0]).text());
      if (!symbol) {
        return;
      }

      const closePrice = this.parseNumber($(cells[1]).text());
      if (closePrice <= 0) {
        return;
      }

      const changePct = this.parseNullablePercentage($(cells[2]).text());
      const volume = this.parseNullableNumber($(cells[3]).text());

      rows.push({
        symbol,
        closePrice,
        changePct,
        volume,
      });
    });

    return rows;
  }

  private toMarketQuote(row: ParsedRavaRow): MarketQuote {
    return new MarketQuote(new Date(), {
      closePrice: row.closePrice,
      priceArs: row.closePrice,
      changePct: row.changePct,
      volume: row.volume,
      openPrice: null,
      highPrice: null,
      lowPrice: null,
      priceUsd: null,
    });
  }

  private normalizeSymbol(value: string): string {
    return value.replace('.BA', '').trim().toUpperCase();
  }

  private parseNullablePercentage(value: string): number | null {
    const normalized = value.replace('%', '');
    const parsed = this.parseNumber(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private parseNullableNumber(value: string): number | null {
    const parsed = this.parseNumber(value);
    return parsed > 0 ? parsed : null;
  }

  private parseNumber(value: string): number {
    const cleaned = value.replace(/\s/g, '');
    if (!cleaned) {
      return 0;
    }

    let normalized = cleaned;
    if (cleaned.includes(',') && cleaned.includes('.')) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      normalized = cleaned.replace(',', '.');
    } else if (cleaned.split('.').length > 2) {
      normalized = cleaned.replace(/\./g, '');
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  private async ensureRobotsAllows(path: string): Promise<void> {
    const now = Date.now();

    if (
      now - this.robotsCache.checkedAt >
      RavaScraperClient.ROBOTS_CACHE_TTL_MS
    ) {
      const response = await this.providerHealthTracker.track(
        'rava.com',
        '/robots.txt',
        () =>
          axios.get<string>(`${this.baseUrl}/robots.txt`, {
            timeout: 5000,
            headers: {
              'User-Agent': this.userAgent,
            },
          }),
      );

      this.robotsCache = {
        checkedAt: now,
        disallowedPaths: this.parseDisallowedPaths(response.data),
      };
    }

    const blocked = this.robotsCache.disallowedPaths.some((disallowedPath) =>
      path.startsWith(disallowedPath),
    );

    if (blocked) {
      throw new Error(`Rava robots.txt disallows scraping path ${path}`);
    }
  }

  private parseDisallowedPaths(robotsContent: string): string[] {
    const disallowedPaths: string[] = [];
    let inGlobalUserAgent = false;

    const lines = robotsContent.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const [rawKey, ...rawValue] = trimmed.split(':');
      if (!rawKey || rawValue.length === 0) {
        continue;
      }

      const key = rawKey.trim().toLowerCase();
      const value = rawValue.join(':').trim();

      if (key === 'user-agent') {
        inGlobalUserAgent = value === '*';
        continue;
      }

      if (key === 'disallow' && inGlobalUserAgent && value.startsWith('/')) {
        disallowedPaths.push(value);
      }
    }

    return disallowedPaths;
  }

  private async waitForRateLimit(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestAt;
    const pendingMs = this.rateLimitMs - elapsed;

    if (pendingMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, pendingMs));
    }

    this.lastRequestAt = Date.now();
  }
}
