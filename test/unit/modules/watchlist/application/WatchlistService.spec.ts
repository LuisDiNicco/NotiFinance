import { Test, TestingModule } from '@nestjs/testing';
import {
  WATCHLIST_REPOSITORY,
  IWatchlistRepository,
} from '../../../../../src/modules/watchlist/application/IWatchlistRepository';
import { WatchlistService } from '../../../../../src/modules/watchlist/application/WatchlistService';
import { MarketDataService } from '../../../../../src/modules/market-data/application/MarketDataService';
import { Asset } from '../../../../../src/modules/market-data/domain/entities/Asset';
import { AssetType } from '../../../../../src/modules/market-data/domain/enums/AssetType';
import { WatchlistItem } from '../../../../../src/modules/watchlist/domain/entities/WatchlistItem';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let repository: jest.Mocked<IWatchlistRepository>;
  let marketDataService: jest.Mocked<MarketDataService>;

  beforeEach(async () => {
    repository = {
      findByUserId: jest.fn(),
      findByUserAndAsset: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
    };

    marketDataService = {
      getAssetByTicker: jest.fn(),
    } as unknown as jest.Mocked<MarketDataService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        {
          provide: WATCHLIST_REPOSITORY,
          useValue: repository,
        },
        {
          provide: MarketDataService,
          useValue: marketDataService,
        },
      ],
    }).compile();

    service = module.get(WatchlistService);
  });

  const buildAsset = (id?: string): Asset => {
    const asset = new Asset(
      'GGAL',
      'Galicia',
      AssetType.STOCK,
      'Financiero',
      'GGAL.BA',
    );
    if (id) {
      asset.id = id;
    }
    return asset;
  };

  it('returns user watchlist', async () => {
    const item = new WatchlistItem({ userId: 'user-1', assetId: 'asset-1' });
    repository.findByUserId.mockResolvedValue([item]);

    const result = await service.getUserWatchlist('user-1');

    expect(result).toEqual([item]);
  });

  it('adds ticker to watchlist when it does not exist', async () => {
    marketDataService.getAssetByTicker.mockResolvedValue(buildAsset('asset-1'));
    repository.findByUserAndAsset.mockResolvedValue(null);
    repository.save.mockImplementation(async (item) => item);

    const saved = await service.addToWatchlist('user-1', 'GGAL');

    expect(saved.assetId).toBe('asset-1');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('returns existing watchlist item when already present', async () => {
    marketDataService.getAssetByTicker.mockResolvedValue(buildAsset('asset-1'));
    const existing = new WatchlistItem({
      userId: 'user-1',
      assetId: 'asset-1',
    });
    existing.id = 'watch-1';
    repository.findByUserAndAsset.mockResolvedValue(existing);

    const result = await service.addToWatchlist('user-1', 'GGAL');

    expect(result.id).toBe('watch-1');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('throws when asset has no persistent id on add', async () => {
    marketDataService.getAssetByTicker.mockResolvedValue(buildAsset(undefined));

    await expect(service.addToWatchlist('user-1', 'GGAL')).rejects.toThrow(
      'Asset GGAL has no persistent id',
    );
  });

  it('returns silently on remove when asset has no id', async () => {
    marketDataService.getAssetByTicker.mockResolvedValue(buildAsset(undefined));

    await service.removeFromWatchlist('user-1', 'GGAL');

    expect(repository.findByUserAndAsset).not.toHaveBeenCalled();
    expect(repository.deleteById).not.toHaveBeenCalled();
  });

  it('returns silently on remove when item does not exist', async () => {
    marketDataService.getAssetByTicker.mockResolvedValue(buildAsset('asset-1'));
    repository.findByUserAndAsset.mockResolvedValue(null);

    await service.removeFromWatchlist('user-1', 'GGAL');

    expect(repository.deleteById).not.toHaveBeenCalled();
  });

  it('deletes item on remove when present', async () => {
    marketDataService.getAssetByTicker.mockResolvedValue(buildAsset('asset-1'));
    const existing = new WatchlistItem({
      userId: 'user-1',
      assetId: 'asset-1',
    });
    existing.id = 'watch-1';
    repository.findByUserAndAsset.mockResolvedValue(existing);

    await service.removeFromWatchlist('user-1', 'GGAL');

    expect(repository.deleteById).toHaveBeenCalledWith('watch-1');
  });
});
