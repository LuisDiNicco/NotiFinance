import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IPortfolioRepository } from '../../../../application/IPortfolioRepository';
import { Portfolio } from '../../../../domain/entities/Portfolio';
import { PortfolioEntity } from '../entities/PortfolioEntity';
import { PortfolioMapper } from '../maps/PortfolioMapper';

@Injectable()
export class TypeOrmPortfolioRepository implements IPortfolioRepository {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly repository: Repository<PortfolioEntity>,
  ) {}

  public async findByUserId(userId: string): Promise<Portfolio[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => PortfolioMapper.toDomain(entity));
  }

  public async findById(id: string): Promise<Portfolio | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PortfolioMapper.toDomain(entity) : null;
  }

  public async save(portfolio: Portfolio): Promise<Portfolio> {
    const entity = PortfolioMapper.toPersistence(portfolio);
    const saved = await this.repository.save(entity);
    return PortfolioMapper.toDomain(saved);
  }

  public async delete(id: string): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
