import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialAssets1760000000003 implements MigrationInterface {
    name = 'SeedInitialAssets1760000000003';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "assets" ("ticker", "name", "assetType", "sector", "yahooTicker", "isActive")
            VALUES
                ('GGAL', 'Grupo Financiero Galicia', 'STOCK', 'Financiero', 'GGAL.BA', true),
                ('YPFD', 'YPF', 'STOCK', 'Energía', 'YPFD.BA', true),
                ('PAMP', 'Pampa Energía', 'STOCK', 'Energía', 'PAMP.BA', true),
                ('AAPL', 'Apple (CEDEAR)', 'CEDEAR', 'Tecnología', 'AAPL.BA', true),
                ('MSFT', 'Microsoft (CEDEAR)', 'CEDEAR', 'Tecnología', 'MSFT.BA', true),
                ('AL30', 'Bonares 2030', 'BOND', 'Renta Fija', 'AL30.BA', true),
                ('GD30', 'Globales 2030', 'BOND', 'Renta Fija', 'GD30.BA', true)
            ON CONFLICT ("ticker") DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "assets"
            WHERE "ticker" IN ('GGAL', 'YPFD', 'PAMP', 'AAPL', 'MSFT', 'AL30', 'GD30')
        `);
    }
}