import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreferencesSchedulingFields1760000000009 implements MigrationInterface {
  name = 'AddPreferencesSchedulingFields1760000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_preferences"
            ADD COLUMN IF NOT EXISTS "quietHoursStart" varchar(5),
            ADD COLUMN IF NOT EXISTS "quietHoursEnd" varchar(5),
            ADD COLUMN IF NOT EXISTS "digestFrequency" varchar(20) NOT NULL DEFAULT 'REALTIME'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "user_preferences"
            DROP COLUMN IF EXISTS "digestFrequency",
            DROP COLUMN IF EXISTS "quietHoursEnd",
            DROP COLUMN IF EXISTS "quietHoursStart"
        `);
  }
}
