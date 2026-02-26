import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginRequest {
    @ApiProperty({ example: 'luis@example.com' })
    @IsEmail()
    public readonly email!: string;

    @ApiProperty({ example: 'MiPassword123!', minLength: 8, maxLength: 128 })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    public readonly password!: string;
}
