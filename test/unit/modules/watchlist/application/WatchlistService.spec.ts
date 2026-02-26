import { Test, TestingModule } from '@nestjs/testing';
import { WATCHLIST_REPOSITORY, IWatchlistRepository } from '../../../../../src/modules/watchlist/application/IWatchlistRepository';
import { WatchlistService } from '../../../../../src/modules/watchlist/application/WatchlistService';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import { Asset } from '../../../../../src/modules/market-data/domain/entities/Asset';
import { AssetType } from '../../../../../src/modules/market-data/domain/enums/AssetType';

describe('WatchlistService', () => {
    let service: WatchlistService;
    let repository: jest.Mocked<IWatchlistRepository>;

    beforeEach(async () => {
        repository = {
            findByUserId: jest.fn(),
            findByUserAndAsset: jest.fn(),
            save: jest.fn(),
            deleteById: jest.fn(),
        };

        const asset = new Asset('GGAL', 'Galicia', AssetType.STOCK, 'Financiero', 'GGAL.BA');
        asset.id = 'asset-1';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WatchlistService,
                {
                    provide: WATCHLIST_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: MarketDataService,
                    useValue: {
                        getAssetByTicker: jest.fn().mockResolvedValue(asset),
                    },
                },
            ],
        }).compile();

        service = module.get(WatchlistService);
    });

    it('adds ticker to watchlist', async () => {
        repository.findByUserAndAsset.mockResolvedValue(null);
        repository.save.mockImplementation(async (item) => item);

        const saved = await service.addToWatchlist('user-1', 'GGAL');
        expect(saved.assetId).toBe('asset-1');
    });
});
