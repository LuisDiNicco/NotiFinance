import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.service';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async (configService: ConfigService) => {
                const client = createClient({
                    url: configService.get<string>('REDIS_URL') as string,
                });
                await client.connect();
                return client;
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule { }
