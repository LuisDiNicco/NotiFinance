import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { type IUserRepository } from '../../../../application/IUserRepository';
import { User } from '../../../../domain/entities/User';
import { UserEntity } from '../entities/UserEntity';
import { UserMapper } from '../maps/UserMapper';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
    ) { }

    public async findByEmail(email: string): Promise<User | null> {
        const entity = await this.repository.findOne({ where: { email } });
        return entity ? UserMapper.toDomain(entity) : null;
    }

    public async findById(id: string): Promise<User | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? UserMapper.toDomain(entity) : null;
    }

    public async save(user: User): Promise<User> {
        const persisted = await this.repository.save(UserMapper.toPersistence(user));
        return UserMapper.toDomain(persisted);
    }

    public async deleteExpiredDemoUsers(expirationDate: Date): Promise<number> {
        const result = await this.repository.delete({
            isDemo: true,
            createdAt: LessThan(expirationDate),
        });

        return result.affected ?? 0;
    }
}
