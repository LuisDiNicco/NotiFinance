import { User } from '../../../../domain/entities/User';
import { UserEntity } from '../entities/UserEntity';

export class UserMapper {
    static toDomain(entity: UserEntity): User {
        const user = new User(
            entity.email,
            entity.passwordHash,
            entity.displayName,
            entity.isDemo,
        );

        user.id = entity.id;
        return user;
    }

    static toPersistence(user: User): Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
        return {
            email: user.email,
            passwordHash: user.passwordHash,
            displayName: user.displayName,
            isDemo: user.isDemo,
        };
    }
}
