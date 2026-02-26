import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../../domain/entities/User';

export class UserAuthResponse {
    @ApiProperty({ example: 'a8c55f8a-132d-4cc6-9daa-73fdce6d5f95' })
    public readonly id!: string;

    @ApiProperty({ example: 'luis@example.com' })
    public readonly email!: string;

    @ApiProperty({ example: 'Luis Dev' })
    public readonly displayName!: string;

    @ApiProperty({ example: false })
    public readonly isDemo!: boolean;

    static fromEntity(user: User): UserAuthResponse {
        if (!user.id) {
            throw new Error('User id is required');
        }

        return {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            isDemo: user.isDemo,
        };
    }
}
