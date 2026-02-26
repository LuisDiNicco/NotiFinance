import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { type IDollarQuoteRepository } from '../../../../application/IDollarQuoteRepository';
import { DollarQuote } from '../../../../domain/entities/DollarQuote';
import { DollarType } from '../../../../domain/enums/DollarType';
import { DollarQuoteEntity } from '../entities/DollarQuoteEntity';

interface RawDollarQuoteRow {
  type: string;
  buyPrice: string;
  sellPrice: string;
  source: string;
  timestamp: string;
}

@Injectable()
export class TypeOrmDollarQuoteRepository implements IDollarQuoteRepository {
  constructor(
    @InjectRepository(DollarQuoteEntity)
    private readonly repository: Repository<DollarQuoteEntity>,
  ) {}

  public async saveMany(quotes: DollarQuote[]): Promise<void> {
    if (quotes.length === 0) {
      return;
    }

    const entities = quotes.map((quote) =>
      this.repository.create({
        type: quote.type,
        buyPrice: quote.buyPrice,
        sellPrice: quote.sellPrice,
        source: quote.source,
        timestamp: quote.timestamp,
      }),
    );

    await this.repository.save(entities);
  }

  public async findLatestByType(): Promise<DollarQuote[]> {
    const rawRows: unknown = await this.repository.query(`
            SELECT DISTINCT ON ("type")
                "type",
                "buyPrice",
                "sellPrice",
                "source",
                "timestamp"
            FROM "dollar_quotes"
            ORDER BY "type", "timestamp" DESC
        `);

    const rows = Array.isArray(rawRows) ? (rawRows as RawDollarQuoteRow[]) : [];

    return rows.map(
      (row) =>
        new DollarQuote(
          row.type as DollarType,
          Number(row.buyPrice),
          Number(row.sellPrice),
          new Date(row.timestamp),
          row.source,
        ),
    );
  }

  public async findHistoryByType(
    type: DollarType,
    days: number,
  ): Promise<DollarQuote[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.max(days, 1));

    const entities = await this.repository.find({
      where: {
        type,
        timestamp: MoreThanOrEqual(startDate),
      },
      order: {
        timestamp: 'ASC',
      },
    });

    return entities.map(
      (entity) =>
        new DollarQuote(
          entity.type as DollarType,
          Number(entity.buyPrice),
          Number(entity.sellPrice),
          entity.timestamp,
          entity.source,
        ),
    );
  }

  public async findLatestTimestamp(): Promise<Date | null> {
    const row = await this.repository
      .createQueryBuilder('quote')
      .select('MAX(quote.timestamp)', 'latest')
      .getRawOne<{ latest: Date | null }>();

    if (!row?.latest) {
      return null;
    }

    return new Date(row.latest);
  }
}
