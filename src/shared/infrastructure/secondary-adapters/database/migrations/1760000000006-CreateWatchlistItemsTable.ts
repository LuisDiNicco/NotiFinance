import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWatchlistItemsTable1760000000006 implements MigrationInterface {
    name = 'CreateWatchlistItemsTable1760000000006';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "watchlist_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" uuid NOT NULL,
                "assetId" uuid NOT NULL,
                CONSTRAINT "PK_watchlist_items_id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_watchlist_user_asset" UNIQUE ("userId", "assetId"),
                CONSTRAINT "FK_watchlist_asset_id" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_watchlist_user_created" ON "watchlist_items" ("userId", "createdAt")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_watchlist_user_created"');
        await queryRunner.query('DROP TABLE IF EXISTS "watchlist_items"');
    }
}
