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
import { Asset } from '../../../../../src/modules/market-data/domain/entities/Asset';
import { AssetType } from '../../../../../src/modules/market-data/domain/enums/AssetType';
import { DollarQuote } from '../../../../../src/modules/market-data/domain/entities/DollarQuote';
import { DollarType } from '../../../../../src/modules/market-data/domain/enums/DollarType';
import { CountryRisk } from '../../../../../src/modules/market-data/domain/entities/CountryRisk';
import { AssetNotFoundError } from '../../../../../src/modules/market-data/domain/errors/AssetNotFoundError';
import { MarketQuote } from '../../../../../src/modules/market-data/domain/entities/MarketQuote';
import { RedisService } from '../../../../../src/shared/infrastructure/base/redis/redis.service';

describe('MarketDataService', () => {
    let service: MarketDataService;
    let assetRepository: jest.Mocked<IAssetRepository>;
    let dollarProvider: jest.Mocked<IDollarProvider>;
    let riskProvider: jest.Mocked<IRiskProvider>;
    let dollarQuoteRepository: jest.Mocked<IDollarQuoteRepository>;
    let countryRiskRepository: jest.Mocked<ICountryRiskRepository>;
    let quoteProvider: jest.Mocked<IQuoteProvider>;
    let quoteRepository: jest.Mocked<IQuoteRepository>;
    let eventPublisher: jest.Mocked<IEventPublisher>;
    let configService: jest.Mocked<ConfigService>;
    let redisService: jest.Mocked<RedisService>;

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
            findLatestTimestamp: jest.fn(),
        };

        countryRiskRepository = {
            save: jest.fn(),
            findLatest: jest.fn(),
        };

        quoteProvider = {
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
        } as jest.Mocked<ConfigService>;

        redisService = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(undefined),
            setNx: jest.fn(),
            ping: jest.fn(),
        } as jest.Mocked<RedisService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarketDataService,
                {
                    provide: ConfigService,
                    useValue: configService,
                },
                {
                    provide: RedisService,
                    useValue: redisService,
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
});
