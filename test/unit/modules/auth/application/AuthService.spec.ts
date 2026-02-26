import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../../../../src/modules/auth/application/AuthService';
import {
    IUserRepository,
    USER_REPOSITORY,
} from '../../../../../src/modules/auth/application/IUserRepository';
import { User } from '../../../../../src/modules/auth/domain/entities/User';
import { EmailAlreadyExistsError } from '../../../../../src/modules/auth/domain/errors/EmailAlreadyExistsError';
import { InvalidCredentialsError } from '../../../../../src/modules/auth/domain/errors/InvalidCredentialsError';
import { DemoSeedService } from '../../../../../src/modules/auth/application/DemoSeedService';

describe('AuthService', () => {
    let service: AuthService;
    let repository: jest.Mocked<IUserRepository>;
    let jwtService: jest.Mocked<JwtService>;
    let demoSeedService: jest.Mocked<DemoSeedService>;

    beforeEach(async () => {
        repository = {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            deleteExpiredDemoUsers: jest.fn(),
        };

        jwtService = {
            sign: jest.fn().mockImplementation((payload: object) => JSON.stringify(payload)),
            verifyAsync: jest.fn(),
        } as unknown as jest.Mocked<JwtService>;

        demoSeedService = {
            createDemoUserWithSeedData: jest.fn(),
        } as unknown as jest.Mocked<DemoSeedService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: USER_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: JwtService,
                    useValue: jwtService,
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string, defaultValue?: string) => {
                            const map: Record<string, string> = {
                                'auth.jwtRefreshSecret': 'refresh-secret',
                                'auth.jwtRefreshExpiresIn': '7d',
                            };
                            return map[key] ?? defaultValue;
                        }),
                    },
                },
                {
                    provide: DemoSeedService,
                    useValue: demoSeedService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('registers a new user and returns tokens', async () => {
        repository.findByEmail.mockResolvedValue(null);
        repository.save.mockImplementation(async (user: User) => {
            user.id = 'user-1';
            return user;
        });

        const result = await service.register('test@example.com', 'StrongPass123!', 'Test User');

        expect(result.user.email).toBe('test@example.com');
        expect(result.user.id).toBe('user-1');
        expect(result.tokens.accessToken).toBeDefined();
        expect(result.tokens.refreshToken).toBeDefined();
    });

    it('throws EmailAlreadyExistsError when email already exists', async () => {
        const existing = new User('test@example.com', 'hash', 'Existing', false);
        existing.id = 'existing-id';

        repository.findByEmail.mockResolvedValue(existing);

        await expect(
            service.register('test@example.com', 'StrongPass123!', 'Test User'),
        ).rejects.toThrow(EmailAlreadyExistsError);
    });

    it('throws InvalidCredentialsError on bad login', async () => {
        repository.findByEmail.mockResolvedValue(null);

        await expect(service.login('bad@example.com', 'wrong-password')).rejects.toThrow(
            InvalidCredentialsError,
        );
    });

    it('refreshes token for valid user', async () => {
        jwtService.verifyAsync.mockResolvedValue({
            sub: 'user-1',
            email: 'test@example.com',
            isDemo: false,
        });

        const user = new User('test@example.com', 'hash', 'Test User', false);
        user.id = 'user-1';
        repository.findById.mockResolvedValue(user);

        const result = await service.refreshToken('refresh-token');

        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(repository.findById).toHaveBeenCalledWith('user-1');
    });

    it('creates demo session with 24h access token and no refresh token', async () => {
        const demoUser = new User('demo@example.com', 'hash', 'Usuario Demo', true);
        demoUser.id = 'demo-user-1';
        demoSeedService.createDemoUserWithSeedData.mockResolvedValue(demoUser);

        const result = await service.createDemoSession();

        expect(demoSeedService.createDemoUserWithSeedData).toHaveBeenCalledTimes(1);
        expect(result.user.id).toBe('demo-user-1');
        expect(result.tokens.accessToken).toBeDefined();
        expect(result.tokens.refreshToken).toBeUndefined();
        expect(jwtService.sign).toHaveBeenCalledWith(
            expect.objectContaining({
                sub: 'demo-user-1',
                email: 'demo@example.com',
                isDemo: true,
            }),
            expect.objectContaining({ expiresIn: 86400 }),
        );
    });
});
