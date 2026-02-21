import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';

const isProduction = process.env['NODE_ENV'] === 'production';

@Global()
@Module({
    imports: [
        LoggerModule.forRoot({
            pinoHttp: {
                level: !isProduction ? 'debug' : 'info',
                transport: !isProduction
                    ? { target: 'pino-pretty', options: { colorize: true } }
                    : undefined,
                autoLogging: false,
                customProps: (req: IncomingMessage, _res: ServerResponse) => ({
                    context: 'HTTP',
                    correlationId: req.headers['x-correlation-id'] || 'no-correlation-id',
                }),
            } as any,
        }),
    ],
    exports: [LoggerModule],
})
export class LoggerConfigModule { }
