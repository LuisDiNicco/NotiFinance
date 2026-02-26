import { Portfolio } from '../../../../domain/entities/Portfolio';
import { PortfolioEntity } from '../entities/PortfolioEntity';

export class PortfolioMapper {
  public static toDomain(entity: PortfolioEntity): Portfolio {
    const portfolio = new Portfolio({
      userId: entity.userId,
      name: entity.name,
      description: entity.description,
    });

    portfolio.id = entity.id;
    return portfolio;
  }

  public static toPersistence(domain: Portfolio): PortfolioEntity {
    const entity = new PortfolioEntity();
    if (domain.id) {
      entity.id = domain.id;
    }

    entity.userId = domain.userId;
    entity.name = domain.name;
    entity.description = domain.description;
    return entity;
  }
}
