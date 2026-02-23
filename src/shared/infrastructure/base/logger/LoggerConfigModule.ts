import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';

const isProduction = process.env['NODE_ENV'] === 'production';

const pinoHttpConfig = isProduction
    ? {
        level: 'info' as const,
        autoLogging: false,
        customProps: (req: IncomingMessage, _res: ServerResponse) => ({
            context: 'HTTP',
            correlationId: req.headers['x-correlation-id'] || 'no-correlation-id',
        }),
    }
    : {
        level: 'debug' as const,
        transport: { target: 'pino-pretty', options: { colorize: true } },
        autoLogging: false,
        customProps: (req: IncomingMessage, _res: ServerResponse) => ({
            context: 'HTTP',
            correlationId: req.headers['x-correlation-id'] || 'no-correlation-id',
        }),
    };

@Global()
@Module({
    imports: [
        LoggerModule.forRoot({
            pinoHttp: pinoHttpConfig,
        }),
    ],
    exports: [LoggerModule],
})
export class LoggerConfigModule { }
