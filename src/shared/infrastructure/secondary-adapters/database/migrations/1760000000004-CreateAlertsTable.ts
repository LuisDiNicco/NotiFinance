import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlertsTable1760000000004 implements MigrationInterface {
    name = 'CreateAlertsTable1760000000004';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "alerts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" uuid NOT NULL,
                "assetId" uuid,
                "alertType" varchar(30) NOT NULL,
                "condition" varchar(30) NOT NULL,
                "threshold" numeric(18,6) NOT NULL,
                "period" varchar(50),
                "channels" text NOT NULL,
                "isRecurring" boolean NOT NULL DEFAULT true,
                "status" varchar(30) NOT NULL DEFAULT 'ACTIVE',
                "lastTriggeredAt" TIMESTAMP,
                CONSTRAINT "PK_alerts_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_alerts_asset_id" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_alerts_user_status" ON "alerts" ("userId", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_alerts_asset_status" ON "alerts" ("assetId", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_alerts_type_status" ON "alerts" ("alertType", "status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_alerts_type_status"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_alerts_asset_status"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_alerts_user_status"');
        await queryRunner.query('DROP TABLE IF EXISTS "alerts"');
    }
}
