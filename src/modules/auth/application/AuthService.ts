import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { USER_REPOSITORY, type IUserRepository } from './IUserRepository';
import { User } from '../domain/entities/User';
import { EmailAlreadyExistsError } from '../domain/errors/EmailAlreadyExistsError';
import { InvalidCredentialsError } from '../domain/errors/InvalidCredentialsError';
import { DemoSeedService } from './DemoSeedService';

interface TokenPayload {
    sub: string;
    email: string;
    isDemo: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

@Injectable()
export class AuthService {
    private static readonly SALT_ROUNDS = 10;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly demoSeedService: DemoSeedService,
    ) { }

    public async register(email: string, password: string, displayName: string): Promise<{ user: User; tokens: AuthTokens; }> {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await this.userRepository.findByEmail(normalizedEmail);

        if (existingUser) {
            throw new EmailAlreadyExistsError(normalizedEmail);
        }

        const passwordHash = await bcrypt.hash(password, AuthService.SALT_ROUNDS);
        const user = new User(normalizedEmail, passwordHash, displayName, false);
        const savedUser = await this.userRepository.save(user);

        return {
            user: savedUser,
            tokens: this.generateTokens(savedUser),
        };
    }

    public async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens; }> {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await this.userRepository.findByEmail(normalizedEmail);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        return {
            user,
            tokens: this.generateTokens(user),
        };
    }

    public async refreshToken(token: string): Promise<AuthTokens> {
        const refreshSecret = this.configService.get<string>('auth.jwtRefreshSecret', 'refresh-secret');
        const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
            secret: refreshSecret,
        });

        const user = await this.userRepository.findById(payload.sub);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        return this.generateTokens(user);
    }

    public async createDemoSession(): Promise<{ user: User; tokens: AuthTokens; }> {
        const savedUser = await this.demoSeedService.createDemoUserWithSeedData();

        return {
            user: savedUser,
            tokens: this.generateDemoTokens(savedUser),
        };
    }

    public async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new InvalidCredentialsError();
        }

        return user;
    }

    private generateTokens(user: User): AuthTokens {
        if (!user.id) {
            throw new Error('User id is required to generate tokens');
        }

        const payload: TokenPayload = {
            sub: user.id,
            email: user.email,
            isDemo: user.isDemo,
        };

        const refreshSecret = this.configService.get<string>('auth.jwtRefreshSecret', 'refresh-secret');
        const refreshExpiresIn = this.configService.get<string>('auth.jwtRefreshExpiresIn', '7d');
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: refreshSecret,
            expiresIn: this.parseDurationToSeconds(refreshExpiresIn),
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private parseDurationToSeconds(value: string): number {
        const trimmedValue = value.trim().toLowerCase();
        const match = trimmedValue.match(/^(\d+)(s|m|h|d)$/);

        if (!match) {
            return 604800;
        }

        const amount = Number(match[1]);
        const unit = match[2];

        switch (unit) {
            case 's':
                return amount;
            case 'm':
                return amount * 60;
            case 'h':
                return amount * 3600;
            case 'd':
                return amount * 86400;
            default:
                return 604800;
        }
    }

    private generateDemoTokens(user: User): AuthTokens {
        if (!user.id) {
            throw new Error('User id is required to generate tokens');
        }

        const payload: TokenPayload = {
            sub: user.id,
            email: user.email,
            isDemo: user.isDemo,
        };

        return {
            accessToken: this.jwtService.sign(payload, {
                expiresIn: 24 * 60 * 60,
            }),
        };
    }
}
