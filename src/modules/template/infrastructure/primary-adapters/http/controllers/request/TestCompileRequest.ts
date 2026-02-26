import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, MinLength } from 'class-validator';

export class TestCompileRequest {
    @ApiProperty({
        description: 'Event type whose template should be compiled',
        example: 'payment.success',
    })
    @IsString()
    @MinLength(2)
    eventType!: string;

    @ApiProperty({
        description: 'Runtime context used to render placeholders',
        example: {
            amount: 42,
            reference: 'TXN-1234',
        },
    })
    @IsObject()
    context!: Record<string, unknown>;
}
