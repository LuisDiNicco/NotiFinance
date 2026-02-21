import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL') as string,
    autoLoadEntities: true,
    synchronize: false, // Strict Requirement: Never True
    migrations: [__dirname + '/../../../../infrastructure/secondary-adapters/database/migrations/*{.ts,.js}'],
    migrationsRun: true,
    logging: configService.get('NODE_ENV') !== 'production',
});
