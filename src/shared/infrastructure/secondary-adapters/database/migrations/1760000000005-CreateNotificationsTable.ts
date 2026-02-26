import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1760000000005 implements MigrationInterface {
    name = 'CreateNotificationsTable1760000000005';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" uuid NOT NULL,
                "alertId" uuid,
                "title" varchar(255) NOT NULL,
                "body" text NOT NULL,
                "type" varchar(60) NOT NULL,
                "metadata" jsonb NOT NULL DEFAULT '{}',
                "isRead" boolean NOT NULL DEFAULT false,
                "readAt" TIMESTAMP,
                CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notifications_user_created" ON "notifications" ("userId", "createdAt")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_notifications_user_is_read" ON "notifications" ("userId", "isRead")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_notifications_user_is_read"');
        await queryRunner.query('DROP INDEX IF EXISTS "IDX_notifications_user_created"');
        await queryRunner.query('DROP TABLE IF EXISTS "notifications"');
    }
}
