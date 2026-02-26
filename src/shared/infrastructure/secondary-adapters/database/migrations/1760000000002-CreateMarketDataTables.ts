import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMarketDataTables1760000000002 implements MigrationInterface {
  name = 'CreateMarketDataTables1760000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "assets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "ticker" varchar(20) NOT NULL,
                "name" varchar(255) NOT NULL,
                "assetType" varchar(50) NOT NULL,
                "sector" varchar(100) NOT NULL DEFAULT 'General',
                "yahooTicker" varchar(30) NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                CONSTRAINT "PK_assets_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_assets_ticker" UNIQUE ("ticker")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "market_quotes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "assetId" uuid NOT NULL,
                "priceArs" numeric(18,4),
                "priceUsd" numeric(18,4),
                "openPrice" numeric(18,4),
                "highPrice" numeric(18,4),
                "lowPrice" numeric(18,4),
                "closePrice" numeric(18,4),
                "volume" bigint,
                "changePct" numeric(8,4),
                "date" date NOT NULL,
                CONSTRAINT "PK_market_quotes_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_market_quotes_asset_date" UNIQUE ("assetId", "date"),
                CONSTRAINT "FK_market_quotes_asset_id" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE
            )
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "dollar_quotes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "type" varchar(20) NOT NULL,
                "buyPrice" numeric(18,4) NOT NULL,
                "sellPrice" numeric(18,4) NOT NULL,
                "source" varchar(100) NOT NULL,
                "timestamp" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_dollar_quotes_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "country_risk" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "value" numeric(18,4) NOT NULL,
                "changePct" numeric(8,4) NOT NULL DEFAULT 0,
                "timestamp" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_country_risk_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_assets_ticker" ON "assets" ("ticker")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_assets_asset_type" ON "assets" ("assetType")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_market_quotes_asset_date" ON "market_quotes" ("assetId", "date")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_dollar_quotes_type_timestamp" ON "dollar_quotes" ("type", "timestamp")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_country_risk_timestamp" ON "country_risk" ("timestamp")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_country_risk_timestamp"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_dollar_quotes_type_timestamp"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "IDX_market_quotes_asset_date"',
    );
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_assets_asset_type"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_assets_ticker"');

    await queryRunner.query('DROP TABLE IF EXISTS "country_risk"');
    await queryRunner.query('DROP TABLE IF EXISTS "dollar_quotes"');
    await queryRunner.query('DROP TABLE IF EXISTS "market_quotes"');
    await queryRunner.query('DROP TABLE IF EXISTS "assets"');
  }
}
