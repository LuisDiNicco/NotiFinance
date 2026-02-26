import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type ITradeRepository } from '../../../../application/ITradeRepository';
import { PaginatedResponse } from '../../../../application/Pagination';
import { Trade } from '../../../../domain/entities/Trade';
import { TradeEntity } from '../entities/TradeEntity';
import { TradeMapper } from '../maps/TradeMapper';

type TradeSortDirection = 'ASC' | 'DESC';

@Injectable()
export class TypeOrmTradeRepository implements ITradeRepository {
  constructor(
    @InjectRepository(TradeEntity)
    private readonly repository: Repository<TradeEntity>,
  ) {}

  public async findByPortfolioId(portfolioId: string): Promise<Trade[]> {
    const entities = await this.repository.find({
      where: { portfolioId },
      order: { executedAt: 'DESC' },
    });

    return entities.map((entity) => TradeMapper.toDomain(entity));
  }

  public async findByPortfolioIdPaginated(
    portfolioId: string,
    page: number,
    limit: number,
    sortBy?: string,
  ): Promise<PaginatedResponse<Trade>> {
    const orderDirection: TradeSortDirection =
      sortBy === 'executedAt:ASC' ? 'ASC' : 'DESC';

    const [entities, total] = await this.repository.findAndCount({
      where: { portfolioId },
      order: { executedAt: orderDirection },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: entities.map((entity) => TradeMapper.toDomain(entity)),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  public async save(trade: Trade): Promise<Trade> {
    const entity = TradeMapper.toPersistence(trade);
    const saved = await this.repository.save(entity);
    return TradeMapper.toDomain(saved);
  }
}
