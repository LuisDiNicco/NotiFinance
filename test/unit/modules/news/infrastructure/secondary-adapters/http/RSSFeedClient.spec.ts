import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AssetEntity } from 'src/modules/market-data/infrastructure/secondary-adapters/database/entities/AssetEntity';
import { RSSFeedClient } from 'src/modules/news/infrastructure/secondary-adapters/http/clients/RSSFeedClient';

describe('RSSFeedClient', () => {
  it('parses RSS fixture and detects ticker mentions from catalog', async () => {
    const assetRepository = {
      find: jest
        .fn()
        .mockResolvedValue([{ ticker: 'GGAL' }, { ticker: 'YPFD' }]),
    } as unknown as Repository<AssetEntity>;

    const configService = {
      get: jest.fn((key: string, fallback: unknown) => {
        if (key === 'market.newsFeeds.ambito') {
          return 'https://source.test/ambito.xml';
        }
        if (key === 'market.newsFeeds.cronista') {
          return 'https://source.test/cronista.xml';
        }
        if (key === 'market.newsFeeds.infobae') {
          return 'https://source.test/infobae.xml';
        }
        if (key === 'market.newsHttpTimeoutMs') {
          return 5000;
        }
        if (key === 'market.newsMaxItemsPerFeed') {
          return 10;
        }

        return fallback;
      }),
    } as unknown as ConfigService;

    const fixturePath = join(__dirname, 'fixtures', 'news-rss.fixture.xml');
    const rssFixture = readFileSync(fixturePath, 'utf8');

    const client = new RSSFeedClient(configService, assetRepository);
    jest
      .spyOn(
        client as unknown as { fetchFeedXml: (url: string) => Promise<string> },
        'fetchFeedXml',
      )
      .mockResolvedValue(rssFixture);

    const result = await client.fetchLatestNews();

    expect(result.length).toBe(3);
    expect(result[0]?.title).toContain('GGAL');
    expect(result[0]?.url).toBe('https://news.test/article-1');
    expect(result[0]?.mentionedTickers).toEqual(['GGAL', 'YPFD']);
  });
});
