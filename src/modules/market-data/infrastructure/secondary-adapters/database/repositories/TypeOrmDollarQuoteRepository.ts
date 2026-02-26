import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { type IDollarQuoteRepository } from '../../../../application/IDollarQuoteRepository';
import { DollarQuote } from '../../../../domain/entities/DollarQuote';
import { DollarType } from '../../../../domain/enums/DollarType';
import { DollarQuoteEntity } from '../entities/DollarQuoteEntity';

@Injectable()
export class TypeOrmDollarQuoteRepository implements IDollarQuoteRepository {
    constructor(
        @InjectRepository(DollarQuoteEntity)
        private readonly repository: Repository<DollarQuoteEntity>,
    ) { }

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
        const rows = await this.repository.query(`
            SELECT DISTINCT ON ("type")
                "type",
                "buyPrice",
                "sellPrice",
                "source",
                "timestamp"
            FROM "dollar_quotes"
            ORDER BY "type", "timestamp" DESC
        `);

        return rows.map(
            (row: {
                type: string;
                buyPrice: string;
                sellPrice: string;
                source: string;
                timestamp: string;
            }) =>
                new DollarQuote(
                    row.type as DollarType,
                    Number(row.buyPrice),
                    Number(row.sellPrice),
                    new Date(row.timestamp),
                    row.source,
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