import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialNotificationTables1760000000000 implements MigrationInterface {
    name = 'InitialNotificationTables1760000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "notification_templates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "name" varchar(150) NOT NULL,
                "eventType" varchar(100) NOT NULL,
                "subjectTemplate" text NOT NULL,
                "bodyTemplate" text NOT NULL,
                CONSTRAINT "UQ_notification_templates_eventType" UNIQUE ("eventType"),
                CONSTRAINT "PK_notification_templates_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_preferences" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" varchar(255) NOT NULL,
                "optInChannels" jsonb NOT NULL DEFAULT '[]'::jsonb,
                "disabledEventTypes" jsonb NOT NULL DEFAULT '[]'::jsonb,
                CONSTRAINT "UQ_user_preferences_userId" UNIQUE ("userId"),
                CONSTRAINT "PK_user_preferences_id" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "user_preferences"');
        await queryRunner.query('DROP TABLE IF EXISTS "notification_templates"');
    }
}
