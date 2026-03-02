import { MEPCCLCalculationService } from '../../../../../src/modules/market-data/application/MEPCCLCalculationService';
import { ProviderOrchestrator } from '../../../../../src/modules/market-data/application/ProviderOrchestrator';
import { IDollarQuoteRepository } from '../../../../../src/modules/market-data/application/IDollarQuoteRepository';
import { MarketQuote } from '../../../../../src/modules/market-data/domain/entities/MarketQuote';
import { DollarQuote } from '../../../../../src/modules/market-data/domain/entities/DollarQuote';
import { DollarType } from '../../../../../src/modules/market-data/domain/enums/DollarType';
import { AssetType } from '../../../../../src/modules/market-data/domain/enums/AssetType';

describe('MEPCCLCalculationService', () => {
  it('calculates MEP/CCL, persists quotes and validates against external sources', async () => {
    const fetchQuote = jest
      .fn()
      .mockImplementation((_: AssetType, ticker: string) => {
        const priceByTicker: Record<string, number> = {
          'AL30.BA': 15000,
          'AL30D.BA': 10,
          'GD30.BA': 16000,
          GD30: 10,
        };

        const resolvedPrice = priceByTicker[ticker];
        if (resolvedPrice == null) {
          throw new Error(`Missing price for ticker ${ticker}`);
        }

        return Promise.resolve({
          quote: new MarketQuote(new Date('2026-01-01T12:00:00.000Z'), {
            closePrice: resolvedPrice,
          }),
          source: 'data912.com',
          confidence: 'HIGH',
          timestamp: new Date('2026-01-01T12:00:00.000Z'),
        });
      });

    const orchestrator = {
      fetchQuote,
    } as unknown as ProviderOrchestrator;

    const saveMany = jest.fn().mockResolvedValue(undefined);
    const findLatestByType = jest
      .fn()
      .mockResolvedValue([
        new DollarQuote(
          DollarType.MEP,
          1490,
          1490,
          new Date('2026-01-01T11:59:00.000Z'),
          'dolarapi.com',
        ),
        new DollarQuote(
          DollarType.CCL,
          1595,
          1595,
          new Date('2026-01-01T11:59:00.000Z'),
          'data912.com',
        ),
      ]);

    const repository = {
      saveMany,
      findLatestByType,
      findHistoryByType: jest.fn(),
      findLatestTimestamp: jest.fn(),
    } as unknown as IDollarQuoteRepository;

    const configService = {
      get: jest.fn((_: string, fallback: unknown) => fallback),
    };

    const service = new MEPCCLCalculationService(
      configService as never,
      orchestrator,
      repository,
    );

    const result = await service.calculateAndPersist();

    expect(fetchQuote).toHaveBeenNthCalledWith(1, AssetType.BOND, 'AL30.BA');
    expect(fetchQuote).toHaveBeenNthCalledWith(2, AssetType.BOND, 'AL30D.BA');
    expect(fetchQuote).toHaveBeenNthCalledWith(3, AssetType.BOND, 'GD30.BA');
    expect(fetchQuote).toHaveBeenNthCalledWith(4, AssetType.BOND, 'GD30');

    expect(saveMany).toHaveBeenCalledTimes(1);
    expect(result.quotes).toHaveLength(2);
    expect(result.quotes[0]?.type).toBe(DollarType.DOLLAR_MEP_CALC);
    expect(result.quotes[0]?.sellPrice).toBe(1500);
    expect(result.quotes[1]?.type).toBe(DollarType.DOLLAR_CCL_CALC);
    expect(result.quotes[1]?.sellPrice).toBe(1600);

    expect(result.validations).toHaveLength(2);
    expect(result.validations[0]?.type).toBe(DollarType.MEP);
    expect(result.validations[0]?.reference).toBe(1490);
    expect(result.validations[1]?.type).toBe(DollarType.CCL);
    expect(result.validations[1]?.reference).toBe(1595);
  });

  it('throws when one bond leg has invalid price', async () => {
    const fetchQuote = jest
      .fn()
      .mockResolvedValueOnce({
        quote: new MarketQuote(new Date('2026-01-01T12:00:00.000Z'), {
          closePrice: 15000,
        }),
        source: 'data912.com',
        confidence: 'HIGH',
        timestamp: new Date('2026-01-01T12:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        quote: new MarketQuote(new Date('2026-01-01T12:00:00.000Z'), {
          closePrice: 0,
        }),
        source: 'data912.com',
        confidence: 'HIGH',
        timestamp: new Date('2026-01-01T12:00:00.000Z'),
      })
      .mockResolvedValue({
        quote: new MarketQuote(new Date('2026-01-01T12:00:00.000Z'), {
          closePrice: 10,
        }),
        source: 'data912.com',
        confidence: 'HIGH',
        timestamp: new Date('2026-01-01T12:00:00.000Z'),
      });

    const orchestrator = {
      fetchQuote,
    } as unknown as ProviderOrchestrator;

    const repository = {
      saveMany: jest.fn(),
      findLatestByType: jest.fn(),
      findHistoryByType: jest.fn(),
      findLatestTimestamp: jest.fn(),
    } as unknown as IDollarQuoteRepository;

    const configService = {
      get: jest.fn((_: string, fallback: unknown) => fallback),
    };

    const service = new MEPCCLCalculationService(
      configService as never,
      orchestrator,
      repository,
    );

    await expect(service.calculateAndPersist()).rejects.toThrow(
      'Invalid price for AL30D.BA',
    );
    expect(repository.saveMany).not.toHaveBeenCalled();
  });

  it('logs warning when deviation exceeds threshold', async () => {
    const fetchQuote = jest
      .fn()
      .mockImplementation((_: AssetType, ticker: string) => {
        const priceByTicker: Record<string, number> = {
          'AL30.BA': 15500,
          'AL30D.BA': 10,
          'GD30.BA': 16000,
          GD30: 10,
        };

        const resolvedPrice = priceByTicker[ticker];
        if (resolvedPrice == null) {
          throw new Error(`Missing price for ticker ${ticker}`);
        }

        return Promise.resolve({
          quote: new MarketQuote(new Date('2026-01-01T12:00:00.000Z'), {
            closePrice: resolvedPrice,
          }),
          source: 'data912.com',
          confidence: 'HIGH',
          timestamp: new Date('2026-01-01T12:00:00.000Z'),
        });
      });

    const orchestrator = {
      fetchQuote,
    } as unknown as ProviderOrchestrator;

    const repository = {
      saveMany: jest.fn().mockResolvedValue(undefined),
      findLatestByType: jest
        .fn()
        .mockResolvedValue([
          new DollarQuote(
            DollarType.MEP,
            1490,
            1490,
            new Date('2026-01-01T11:59:00.000Z'),
            'dolarapi.com',
          ),
        ]),
      findHistoryByType: jest.fn(),
      findLatestTimestamp: jest.fn(),
    } as unknown as IDollarQuoteRepository;

    const configService = {
      get: jest.fn((_: string, fallback: unknown) => fallback),
    };

    const service = new MEPCCLCalculationService(
      configService as never,
      orchestrator,
      repository,
    );

    const warnSpy = jest.spyOn((service as any).logger, 'warn');

    const result = await service.calculateAndPersist();

    expect(result.validations).toHaveLength(1);
    expect(result.validations[0]?.type).toBe(DollarType.MEP);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
