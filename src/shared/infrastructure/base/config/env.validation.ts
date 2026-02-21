import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync, IsOptional } from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(Environment)
    @IsOptional()
    NODE_ENV: Environment = Environment.Development;

    @IsNumber()
    @IsOptional()
    PORT: number = 3000;

    @IsString()
    @IsOptional()
    RABBITMQ_URL: string = 'amqp://guest:guest@localhost:5672';

    @IsString()
    @IsOptional()
    REDIS_URL: string = 'redis://localhost:6379';

    @IsString()
    @IsOptional()
    DATABASE_URL: string = 'postgres://postgres:postgres@localhost:5432/noticore';
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentVariables,
        config,
        { enableImplicitConversion: true },
    );
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
