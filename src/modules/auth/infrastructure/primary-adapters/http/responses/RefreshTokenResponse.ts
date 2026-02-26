import { ApiProperty } from '@nestjs/swagger';
import { AuthTokens } from '../../../../application/AuthService';

export class RefreshTokenResponse {
    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...' })
    public readonly accessToken!: string;

    @ApiProperty({ required: false, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...' })
    public readonly refreshToken?: string;

    static fromTokens(tokens: AuthTokens): RefreshTokenResponse {
        return {
            accessToken: tokens.accessToken,
            ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
        };
    }
}
