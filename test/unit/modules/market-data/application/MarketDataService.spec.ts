import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import {
    ASSET_REPOSITORY,
    IAssetRepository,
} from '../../../../../src/modules/market-data/application/IAssetRepository';
import {
    DOLLAR_PROVIDER,
    IDollarProvider,
} from '../../../../../src/modules/market-data/application/IDollarProvider';
import {
    IRiskProvider,
    RISK_PROVIDER,
} from '../../../../../src/modules/market-data/application/IRiskProvider';
import {
    DOLLAR_QUOTE_REPOSITORY,
    IDollarQuoteRepository,
} from '../../../../../src/modules/market-data/application/IDollarQuoteRepository';
import {
    COUNTRY_RISK_REPOSITORY,
    ICountryRiskRepository,
} from '../../../../../src/modules/market-data/application/ICountryRiskRepository';
import {
    QUOTE_FALLBACK_PROVIDER,
    QUOTE_PROVIDER,
    IQuoteProvider,
} from '../../../../../src/modules/market-data/application/IQuoteProvider';
import {
    QUOTE_REPOSITORY,
    IQuoteRepository,
} from '../../../../../src/modules/market-data/application/IQuoteRepository';
import {
    EVENT_PUBLISHER,
    IEventPublisher,
} from '../../../../../src/modules/ingestion/application/IEventPublisher';
import {
    IMarketCache,
    MARKET_CACHE,
} from '../../../../../src/modules/market-data/application/IMarketCache';
import { Asset } from '../../../../../src/modules/market-data/domain/entities/Asset';
import { AssetType } from '../../../../../src/modules/market-data/domain/enums/AssetType';
import { DollarQuote } from '../../../../../src/modules/market-data/domain/entities/DollarQuote';
import { DollarType } from '../../../../../src/modules/market-data/domain/enums/DollarType';
import { CountryRisk } from '../../../../../src/modules/market-data/domain/entities/CountryRisk';
import { AssetNotFoundError } from '../../../../../src/modules/market-data/domain/errors/AssetNotFoundError';
import { MarketQuote } from '../../../../../src/modules/market-data/domain/entities/MarketQuote';

describe('MarketDataService', () => {
    let service: MarketDataService;
    let assetRepository: jest.Mocked<IAssetRepository>;
    let dollarProvider: jest.Mocked<IDollarProvider>;
    let riskProvider: jest.Mocked<IRiskProvider>;
    let dollarQuoteRepository: jest.Mocked<IDollarQuoteRepository>;
    let countryRiskRepository: jest.Mocked<ICountryRiskRepository>;
    let quoteProvider: jest.Mocked<IQuoteProvider>;
    let fallbackQuoteProvider: jest.Mocked<IQuoteProvider>;
    let quoteRepository: jest.Mocked<IQuoteRepository>;
    let eventPublisher: jest.Mocked<IEventPublisher>;
    let configService: jest.Mocked<ConfigService>;
    let marketCache: jest.Mocked<IMarketCache>;

    beforeEach(async () => {
        assetRepository = {
            findAll: jest.fn(),
            findByTicker: jest.fn(),
            search: jest.fn(),
        };

        dollarProvider = {
            fetchAllDollarQuotes: jest.fn(),
        };

        riskProvider = {
            fetchCountryRisk: jest.fn(),
        };

        dollarQuoteRepository = {
            saveMany: jest.fn(),
            findLatestByType: jest.fn(),
            findHistoryByType: jest.fn(),
            findLatestTimestamp: jest.fn(),
        };

        countryRiskRepository = {
            save: jest.fn(),
            findLatest: jest.fn(),
            findHistory: jest.fn(),
        };

        quoteProvider = {
            fetchQuote: jest.fn(),
            fetchHistorical: jest.fn(),
            fetchBulkQuotes: jest.fn(),
        };

        fallbackQuoteProvider = {
            fetchQuote: jest.fn(),
            fetchHistorical: jest.fn(),
            fetchBulkQuotes: jest.fn(),
        };

        quoteRepository = {
            saveBulkQuotes: jest.fn(),
            findByAssetAndPeriod: jest.fn(),
            findLatestByAsset: jest.fn(),
            findLatestTimestamp: jest.fn(),
            findTopMovers: jest.fn(),
        };

        eventPublisher = {
            publishEvent: jest.fn(),
        };

        configService = {
            get: jest.fn().mockImplementation((key: string, defaultValue?: unknown) => {
                if (key === 'market.chunkDelayMs') {
                    return 0;
                }

                if (key === 'market.quoteRetryAttempts') {
                    return 1;
                }

                if (key === 'market.quoteRetryBaseDelayMs') {
                    return 0;
                }

                return defaultValue;
            }),
        } as unknown as jest.Mocked<ConfigService>;

        marketCache = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
        } as jest.Mocked<IMarketCache>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarketDataService,
                {
                    provide: ConfigService,
                    useValue: configService,
                },
                {
                    provide: MARKET_CACHE,
                    useValue: marketCache,
                },
                {
                    provide: ASSET_REPOSITORY,
                    useValue: assetRepository,
                },
                {
                    provide: DOLLAR_PROVIDER,
                    useValue: dollarProvider,
                },
                {
                    provide: RISK_PROVIDER,
                    useValue: riskProvider,
                },
                {
                    provide: DOLLAR_QUOTE_REPOSITORY,
                    useValue: dollarQuoteRepository,
                },
                {
                    provide: COUNTRY_RISK_REPOSITORY,
                    useValue: countryRiskRepository,
                },
                {
                    provide: QUOTE_PROVIDER,
                    useValue: quoteProvider,
                },
                {
                    provide: QUOTE_FALLBACK_PROVIDER,
                    useValue: fallbackQuoteProvider,
                },
                {
                    provide: QUOTE_REPOSITORY,
                    useValue: quoteRepository,
                },
                {
                    provide: EVENT_PUBLISHER,
                    useValue: eventPublisher,
                },
            ],
        }).compile();

        service = module.get<MarketDataService>(MarketDataService);
    });

    it('returns assets by type', async () => {
        const assets = [new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Financiero', 'GGAL.BA')];
        assetRepository.findAll.mockResolvedValue(assets);

        const result = await service.getAssets(AssetType.STOCK);

        expect(result).toEqual(assets);
        expect(assetRepository.findAll).toHaveBeenCalledWith(AssetType.STOCK);
    });

    it('searches assets by query', async () => {
        const assets = [new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Financiero', 'GGAL.BA')];
        assetRepository.search.mockResolvedValue(assets);

        const result = await service.searchAssets('gga', 5);

        expect(result).toEqual(assets);
        expect(assetRepository.search).toHaveBeenCalledWith('gga', 5);
    });

    it('throws AssetNotFoundError when ticker is missing', async () => {
        assetRepository.findByTicker.mockResolvedValue(null);

        await expect(service.getAssetByTicker('UNKNOWN')).rejects.toThrow(AssetNotFoundError);
    });

    it('returns market summary with dollar and risk', async () => {
        const dollarQuotes = [new DollarQuote(DollarType.MEP, 1000, 1010, new Date(), 'test')];
        const countryRisk = new CountryRisk(700, 1.2, new Date());

        dollarProvider.fetchAllDollarQuotes.mockResolvedValue(dollarQuotes);
        riskProvider.fetchCountryRisk.mockResolvedValue(countryRisk);

        const result = await service.getMarketSummary();

        expect(result).toEqual({
            dollar: dollarQuotes,
            risk: countryRisk,
        });
    });

    it('uses persisted fallback when dollar provider fails', async () => {
        const persisted = [new DollarQuote(DollarType.BLUE, 1000, 1010, new Date(), 'db')];
        dollarProvider.fetchAllDollarQuotes.mockRejectedValue(new Error('provider down'));
        dollarQuoteRepository.findLatestByType.mockResolvedValue(persisted);

        const result = await service.getDollarQuotes();

        expect(result).toEqual(persisted);
        expect(dollarQuoteRepository.findLatestByType).toHaveBeenCalled();
    });

    it('uses persisted fallback when risk provider fails', async () => {
        const persisted = new CountryRisk(800, 1.8, new Date());
        riskProvider.fetchCountryRisk.mockRejectedValue(new Error('provider down'));
        countryRiskRepository.findLatest.mockResolvedValue(persisted);

        const result = await service.getCountryRisk();

        expect(result).toEqual(persisted);
    });

    it('returns and persists historical quotes for an asset', async () => {
        const asset = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Financiero', 'GGAL.BA');
        asset.id = 'asset-id-1';

        const historical = [
            new MarketQuote(new Date('2024-01-01T00:00:00.000Z'), {
                closePrice: 1000,
                openPrice: 980,
            }),
        ];

        assetRepository.findByTicker.mockResolvedValue(asset);
        quoteProvider.fetchHistorical.mockResolvedValue(historical);

        const result = await service.getAssetQuotes('GGAL', 10);

        expect(result).toHaveLength(1);
        expect(result[0]?.assetId).toBe('asset-id-1');
        expect(quoteRepository.saveBulkQuotes).toHaveBeenCalledTimes(1);
    });

    it('returns persisted historical quotes when provider fails', async () => {
        const asset = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Financiero', 'GGAL.BA');
        asset.id = 'asset-id-1';
        const persisted = [
            new MarketQuote(new Date('2024-01-01T00:00:00.000Z'), {
                closePrice: 900,
            }).withAssetId('asset-id-1'),
        ];

        assetRepository.findByTicker.mockResolvedValue(asset);
        quoteProvider.fetchHistorical.mockRejectedValue(new Error('provider down'));
        quoteRepository.findByAssetAndPeriod.mockResolvedValue(persisted);

        const result = await service.getAssetQuotes('GGAL', 15);

        expect(result).toEqual(persisted);
    });

    it('returns market status from cache when present', async () => {
        const cached = {
            now: '2026-01-01T10:00:00.000Z',
            marketOpen: true,
            schedules: {
                stocks: 'a',
                cedears: 'b',
                bonds: 'c',
                dollar: 'd',
                risk: 'e',
            },
            lastUpdate: {
                dollar: null,
                risk: null,
                quotes: null,
            },
        };

        marketCache.get.mockResolvedValueOnce(JSON.stringify(cached));

        const result = await service.getMarketStatus();

        expect(result).toEqual(cached);
        expect(quoteRepository.findLatestTimestamp).not.toHaveBeenCalled();
    });

    it('computes and caches market status when cache is empty', async () => {
        marketCache.get.mockResolvedValueOnce(null);
        dollarQuoteRepository.findLatestTimestamp.mockResolvedValue(new Date('2026-01-01T10:00:00.000Z'));
        countryRiskRepository.findLatest.mockResolvedValue(new CountryRisk(700, 1.1, new Date('2026-01-01T10:01:00.000Z')));
        quoteRepository.findLatestTimestamp.mockResolvedValue(new Date('2026-01-01T10:02:00.000Z'));

        const result = await service.getMarketStatus();

        expect(result.lastUpdate.dollar).toBe('2026-01-01T10:00:00.000Z');
        expect(marketCache.set).toHaveBeenCalled();
    });

    it('returns top movers from cache when present', async () => {
        const cached = {
            gainers: [],
            losers: [],
        };
        marketCache.get.mockResolvedValueOnce(JSON.stringify(cached));

        const result = await service.getTopMovers(AssetType.STOCK, 5);

        expect(result).toEqual(cached);
        expect(quoteRepository.findTopMovers).not.toHaveBeenCalled();
    });

    it('builds top movers response and caches it', async () => {
        const asset = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Fin', 'GGAL.BA');
        asset.id = 'asset-1';

        const quote = new MarketQuote(new Date(), { closePrice: 1000 }).withAssetId('asset-1');

        quoteRepository.findTopMovers.mockResolvedValue({
            gainers: [quote],
            losers: [quote],
        });
        assetRepository.findAll.mockResolvedValue([asset]);

        const result = await service.getTopMovers(AssetType.STOCK, 1);

        expect(result.gainers).toHaveLength(1);
        expect(result.gainers[0]?.asset.ticker).toBe('GGAL');
        expect(marketCache.set).toHaveBeenCalled();
    });

    it('delegates dollar history to repository', async () => {
        const history = [new DollarQuote(DollarType.MEP, 1000, 1010, new Date(), 'db')];
        dollarQuoteRepository.findHistoryByType.mockResolvedValue(history);

        const result = await service.getDollarHistory(DollarType.MEP, 7);

        expect(result).toEqual(history);
        expect(dollarQuoteRepository.findHistoryByType).toHaveBeenCalledWith(DollarType.MEP, 7);
    });

    it('delegates country risk history to repository', async () => {
        const history = [new CountryRisk(700, 1.2, new Date())];
        countryRiskRepository.findHistory.mockResolvedValue(history);

        const result = await service.getCountryRiskHistory(14);

        expect(result).toEqual(history);
        expect(countryRiskRepository.findHistory).toHaveBeenCalledWith(14);
    });

    it('computes asset stats from quote history', async () => {
        const asset = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Fin', 'GGAL.BA');
        asset.id = 'asset-1';
        assetRepository.findByTicker.mockResolvedValue(asset);
        quoteProvider.fetchHistorical.mockResolvedValue([
            new MarketQuote(new Date('2026-01-01T00:00:00.000Z'), { closePrice: 100 }),
            new MarketQuote(new Date('2026-01-02T00:00:00.000Z'), { closePrice: 120 }),
        ]);

        const result = await service.getAssetStats('GGAL', 30);

        expect(result.points).toBe(2);
        expect(result.minClose).toBe(100);
        expect(result.maxClose).toBe(120);
        expect(result.latestClose).toBe(120);
    });

    it('returns related assets by same type and excluding source ticker', async () => {
        const source = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Fin', 'GGAL.BA');
        source.id = 'asset-1';
        const related = new Asset('YPFD', 'YPF', AssetType.STOCK, 'Energy', 'YPFD.BA');
        related.id = 'asset-2';

        assetRepository.findByTicker.mockResolvedValue(source);
        assetRepository.findAll.mockResolvedValue([source, related]);

        const result = await service.getRelatedAssets('GGAL', 5);

        expect(result).toHaveLength(1);
        expect(result[0]?.ticker).toBe('YPFD');
    });

    it('maps top gainers and losers to asset lists', async () => {
        const asset = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Fin', 'GGAL.BA');
        asset.id = 'asset-1';
        const quote = new MarketQuote(new Date(), { closePrice: 1000 }).withAssetId('asset-1');

        quoteRepository.findTopMovers.mockResolvedValue({ gainers: [quote], losers: [quote] });
        assetRepository.findAll.mockResolvedValue([asset]);

        const gainers = await service.getTopGainers(AssetType.STOCK, 1);
        const losers = await service.getTopLosers(AssetType.STOCK, 1);

        expect(gainers[0]?.ticker).toBe('GGAL');
        expect(losers[0]?.ticker).toBe('GGAL');
    });

    it('uses fallback provider for stock refresh when primary provider fails', async () => {
        const asset = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Fin', 'GGAL.BA');
        asset.id = 'asset-1';

        assetRepository.findAll.mockResolvedValue([asset]);
        quoteProvider.fetchQuote.mockRejectedValue(new Error('primary down'));
        fallbackQuoteProvider.fetchQuote.mockResolvedValue(new MarketQuote(new Date(), { closePrice: 1000 }));

        const updated = await service.refreshStockQuotes();

        expect(updated).toBe(1);
        expect(fallbackQuoteProvider.fetchQuote).toHaveBeenCalledWith('GGAL.BA');
        expect(quoteRepository.saveBulkQuotes).toHaveBeenCalled();
    });
});
