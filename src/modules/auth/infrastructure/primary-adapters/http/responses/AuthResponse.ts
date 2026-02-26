import { ApiProperty } from '@nestjs/swagger';
import { AuthTokens } from '../../../../application/AuthService';
import { User } from '../../../../domain/entities/User';
import { UserAuthResponse } from './UserAuthResponse';

export class AuthResponse {
    @ApiProperty({ type: UserAuthResponse })
    public readonly user!: UserAuthResponse;

    @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...' })
    public readonly accessToken!: string;

    @ApiProperty({ required: false, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI...' })
    public readonly refreshToken?: string;

    static fromEntity(user: User, tokens: AuthTokens): AuthResponse {
        return {
            user: UserAuthResponse.fromEntity(user),
            accessToken: tokens.accessToken,
            ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
        };
    }
}
