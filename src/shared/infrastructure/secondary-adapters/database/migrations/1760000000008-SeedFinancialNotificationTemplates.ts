import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedFinancialNotificationTemplates1760000000008 implements MigrationInterface {
    name = 'SeedFinancialNotificationTemplates1760000000008';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "notification_templates"
            WHERE "eventType" IN (
                'payment.success',
                'security.login_alert',
                'marketing.promo',
                'transfer.received',
                'alert.triggered'
            )
        `);

        await queryRunner.query(`
            INSERT INTO "notification_templates" ("name", "eventType", "subjectTemplate", "bodyTemplate")
            VALUES
                ('Alerta Precio Arriba', 'alert.price.above', 'Alerta: precio por encima del umbral', 'El activo alcanzó {{currentValue}} y superó el umbral de {{threshold}}.'),
                ('Alerta Precio Abajo', 'alert.price.below', 'Alerta: precio por debajo del umbral', 'El activo cayó a {{currentValue}} y quedó por debajo de {{threshold}}.'),
                ('Alerta Dólar Arriba', 'alert.dollar.above', 'Alerta: dólar por encima del umbral', 'El dólar alcanzó {{currentValue}} y superó el umbral de {{threshold}}.'),
                ('Alerta Dólar Abajo', 'alert.dollar.below', 'Alerta: dólar por debajo del umbral', 'El dólar cayó a {{currentValue}} y quedó por debajo de {{threshold}}.'),
                ('Alerta Riesgo Arriba', 'alert.risk.above', 'Alerta: riesgo país en alza', 'El riesgo país subió a {{currentValue}} y superó {{threshold}}.'),
                ('Alerta Riesgo Abajo', 'alert.risk.below', 'Alerta: riesgo país en baja', 'El riesgo país bajó a {{currentValue}} y quedó por debajo de {{threshold}}.'),
                ('Alerta Variación Positiva', 'alert.pct.up', 'Alerta: variación porcentual al alza', 'La variación llegó a {{currentValue}}% y superó el umbral de {{threshold}}%.'),
                ('Alerta Variación Negativa', 'alert.pct.down', 'Alerta: variación porcentual a la baja', 'La variación cayó a {{currentValue}}% y perforó el umbral de {{threshold}}%.')
            ON CONFLICT ("eventType")
            DO UPDATE SET
                "name" = EXCLUDED."name",
                "subjectTemplate" = EXCLUDED."subjectTemplate",
                "bodyTemplate" = EXCLUDED."bodyTemplate",
                "updatedAt" = now()
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "notification_templates"
            WHERE "eventType" IN (
                'alert.price.above',
                'alert.price.below',
                'alert.dollar.above',
                'alert.dollar.below',
                'alert.risk.above',
                'alert.risk.below',
                'alert.pct.up',
                'alert.pct.down'
            )
        `);
    }
}
