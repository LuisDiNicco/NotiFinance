import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortfolioTables1760000000007 implements MigrationInterface {
    name = 'CreatePortfolioTables1760000000007';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "portfolios" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" uuid NOT NULL,
                "name" varchar(120) NOT NULL,
                "description" varchar(500),
                CONSTRAINT "PK_portfolios_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "trades" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "portfolioId" uuid NOT NULL,
                "assetId" uuid NOT NULL,
                "tradeType" varchar(10) NOT NULL,
                "quantity" numeric(18,6) NOT NULL,
                "pricePerUnit" numeric(18,6) NOT NULL,
                "currency" varchar(10) NOT NULL,
                "commission" numeric(18,6) NOT NULL DEFAULT 0,
                "executedAt" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_trades_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_trades_portfolio_id" FOREIGN KEY ("portfolioId") REFERENCES "portfolios"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_trades_asset_id" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_portfolios_user_created" ON "portfolios" ("userId", "createdAt")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_trades_portfolio_executed" ON "trades" ("portfolioId", "executedAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_trades_portfolio_executed"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_portfolios_user_created"');
        await queryRunner.query('DROP TABLE IF EXISTS "trades"');
        await queryRunner.query('DROP TABLE IF EXISTS "portfolios"');
    }
}
