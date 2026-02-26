import { User } from '../domain/entities/User';

export const USER_REPOSITORY = 'IUserRepository';

export interface IUserRepository {
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
    deleteExpiredDemoUsers(expirationDate: Date): Promise<number>;
}
