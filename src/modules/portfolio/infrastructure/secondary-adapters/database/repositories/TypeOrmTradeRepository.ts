import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type ITradeRepository } from '../../../../application/ITradeRepository';
import { Trade } from '../../../../domain/entities/Trade';
import { TradeEntity } from '../entities/TradeEntity';
import { TradeMapper } from '../maps/TradeMapper';

@Injectable()
export class TypeOrmTradeRepository implements ITradeRepository {
    constructor(
        @InjectRepository(TradeEntity)
        private readonly repository: Repository<TradeEntity>,
    ) { }

    public async findByPortfolioId(portfolioId: string): Promise<Trade[]> {
        const entities = await this.repository.find({
            where: { portfolioId },
            order: { executedAt: 'DESC' },
        });

        return entities.map(TradeMapper.toDomain);
    }

    public async save(trade: Trade): Promise<Trade> {
        const entity = TradeMapper.toPersistence(trade);
        const saved = await this.repository.save(entity);
        return TradeMapper.toDomain(saved);
    }
}
