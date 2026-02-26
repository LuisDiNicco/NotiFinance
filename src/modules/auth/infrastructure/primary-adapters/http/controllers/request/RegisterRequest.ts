import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterRequest {
    @ApiProperty({ example: 'luis@example.com' })
    @IsEmail()
    public readonly email!: string;

    @ApiProperty({ example: 'MiPassword123!', minLength: 8, maxLength: 128 })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    public readonly password!: string;

    @ApiProperty({ example: 'Luis Dev', minLength: 2, maxLength: 120 })
    @IsString()
    @MinLength(2)
    @MaxLength(120)
    public readonly displayName!: string;
}
