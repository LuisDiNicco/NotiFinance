import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1760000000001 implements MigrationInterface {
  name = 'CreateUsersTable1760000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "email" varchar(255) NOT NULL,
                "passwordHash" varchar(255) NOT NULL,
                "displayName" varchar(120) NOT NULL,
                "isDemo" boolean NOT NULL DEFAULT false,
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_users_email"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}
