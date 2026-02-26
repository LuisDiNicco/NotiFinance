import { User } from '../../../../../../src/modules/auth/domain/entities/User';

describe('User entity', () => {
    it('creates immutable user identity fields correctly', () => {
        const user = new User('user@example.com', 'hash', 'User Name', true);
        user.id = 'user-1';

        expect(user.id).toBe('user-1');
        expect(user.email).toBe('user@example.com');
        expect(user.displayName).toBe('User Name');
        expect(user.isDemo).toBe(true);
        expect(user.passwordHash).toBe('hash');
    });
});
