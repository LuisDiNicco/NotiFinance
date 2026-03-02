import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RavaScraperClient } from '../../../../../../../../src/modules/market-data/infrastructure/secondary-adapters/http/clients/RavaScraperClient';
import { ProviderHealthTracker } from '../../../../../../../../src/modules/market-data/application/ProviderHealthTracker';

jest.mock('axios');

describe('RavaScraperClient', () => {
  let client: RavaScraperClient;
  let tracker: jest.Mocked<ProviderHealthTracker>;

  beforeEach(() => {
    const configService = {
      get: jest
        .fn()
        .mockImplementation((key: string, defaultValue?: unknown) => {
          if (key === 'market.ravaBaseUrl') {
            return 'https://www.rava.com';
          }

          if (key === 'market.scrapingRateLimitMs') {
            return 0;
          }

          if (key === 'market.scrapingUserAgent') {
            return 'NotiFinance/2.0 (educational project)';
          }

          return defaultValue;
        }),
    } as unknown as ConfigService;

    tracker = {
      track: jest.fn(async (_provider, _endpoint, operation) => operation()),
    } as unknown as jest.Mocked<ProviderHealthTracker>;

    client = new RavaScraperClient(configService, tracker);
  });

  it('parses quotes from html fixture', async () => {
    const fixturePath = join(
      __dirname,
      '..',
      'fixtures',
      'rava-cotizaciones.fixture.html',
    );
    const html = readFileSync(fixturePath, 'utf8');

    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockImplementation(async (url: string) => {
      if (url.includes('/robots.txt')) {
        return {
          data: 'User-agent: *\nDisallow: /admin',
        };
      }

      return {
        data: html,
      };
    });

    const quote = await client.fetchQuote('GGAL.BA');
    const bulk = await client.fetchBulkQuotes([
      'GGAL.BA',
      'YPFD.BA',
      'MISSING.BA',
    ]);

    expect(tracker.track).toHaveBeenCalledWith(
      'rava.com',
      '/empresas/cotizaciones',
      expect.any(Function),
    );
    expect(quote.closePrice).toBe(7850.5);
    expect(quote.changePct).toBe(1.62);
    expect(quote.volume).toBe(15234567);
    expect(bulk).toHaveLength(2);
  });

  it('fails when robots.txt disallows target path', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({
      data: 'User-agent: *\nDisallow: /empresas',
    });

    await expect(client.fetchQuote('GGAL.BA')).rejects.toThrow(
      'Rava robots.txt disallows scraping path /empresas/cotizaciones',
    );
  });
});
