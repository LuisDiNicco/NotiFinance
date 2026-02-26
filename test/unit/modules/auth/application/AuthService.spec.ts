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
import { AccountTemporarilyLockedError } from '../../../../../src/modules/auth/domain/errors/AccountTemporarilyLockedError';
import { DemoSeedService } from '../../../../../src/modules/auth/application/DemoSeedService';
import { RedisService } from '../../../../../src/shared/infrastructure/base/redis/redis.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let demoSeedService: jest.Mocked<DemoSeedService>;
  let redisService: {
    get: jest.Mock;
    increment: jest.Mock;
    set: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      deleteExpiredDemoUsers: jest.fn(),
    };

    jwtService = {
      sign: jest
        .fn()
        .mockImplementation(
          (
            payload: object,
            options?: { expiresIn?: string | number; secret?: string },
          ) => JSON.stringify({ payload, options: options ?? {} }),
        ),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    demoSeedService = {
      createDemoUserWithSeedData: jest.fn(),
    } as unknown as jest.Mocked<DemoSeedService>;

    redisService = {
      get: jest.fn().mockResolvedValue(null),
      increment: jest.fn().mockResolvedValue(1),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

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
        {
          provide: RedisService,
          useValue: redisService,
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

    const result = await service.register(
      'test@example.com',
      'StrongPass123!',
      'Test User',
    );

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.id).toBe('user-1');
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
  });

  it('normalizes email during register', async () => {
    repository.findByEmail.mockResolvedValue(null);
    repository.save.mockImplementation(async (user: User) => {
      user.id = 'user-1';
      return user;
    });

    const result = await service.register(
      '  TEST@EXAMPLE.COM ',
      'StrongPass123!',
      'Test User',
    );

    expect(result.user.email).toBe('test@example.com');
    expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('throws EmailAlreadyExistsError when email already exists', async () => {
    const existing = new User('test@example.com', 'hash', 'Existing', false);
    existing.id = 'existing-id';

    repository.findByEmail.mockResolvedValue(existing);

    await expect(
      service.register('test@example.com', 'StrongPass123!', 'Test User'),
    ).rejects.toThrow(EmailAlreadyExistsError);
  });

  it('logs in with valid credentials', async () => {
    const plainPassword = 'StrongPass123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const user = new User('test@example.com', passwordHash, 'User', false);
    user.id = 'user-1';
    repository.findByEmail.mockResolvedValue(user);

    const result = await service.login('test@example.com', plainPassword);

    expect(result.user.id).toBe('user-1');
    expect(result.tokens.accessToken).toBeDefined();
  });

  it('throws InvalidCredentialsError on bad login for unknown user', async () => {
    repository.findByEmail.mockResolvedValue(null);

    await expect(
      service.login('bad@example.com', 'wrong-password'),
    ).rejects.toThrow(InvalidCredentialsError);
    expect(redisService.increment).toHaveBeenCalledWith(
      'auth:login:attempts:bad@example.com',
      900,
    );
  });

  it('throws InvalidCredentialsError on bad login for wrong password', async () => {
    const user = new User(
      'test@example.com',
      '$2b$10$1fxaM1ACr5iNNwQ4f3kV4eYdghA9mQJmS4CDijvQ7vGz8aQJ6QXha',
      'User',
      false,
    );
    user.id = 'user-1';
    repository.findByEmail.mockResolvedValue(user);

    await expect(
      service.login('test@example.com', 'wrong-password'),
    ).rejects.toThrow(InvalidCredentialsError);
    expect(redisService.increment).toHaveBeenCalledWith(
      'auth:login:attempts:test@example.com',
      900,
    );
  });

  it('throws AccountTemporarilyLockedError when account lock key exists', async () => {
    redisService.get.mockResolvedValue('1');

    await expect(
      service.login('test@example.com', 'any-password'),
    ).rejects.toThrow(AccountTemporarilyLockedError);

    expect(repository.findByEmail).not.toHaveBeenCalled();
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

  it('throws InvalidCredentialsError on refresh when user does not exist', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'missing-user',
      email: 'test@example.com',
      isDemo: false,
    });
    repository.findById.mockResolvedValue(null);

    await expect(service.refreshToken('refresh-token')).rejects.toThrow(
      InvalidCredentialsError,
    );
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

  it('validates existing user', async () => {
    const user = new User('test@example.com', 'hash', 'User', false);
    user.id = 'user-1';
    repository.findById.mockResolvedValue(user);

    const result = await service.validateUser('user-1');

    expect(result.id).toBe('user-1');
  });

  it('throws InvalidCredentialsError when validateUser does not find user', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.validateUser('missing-user')).rejects.toThrow(
      InvalidCredentialsError,
    );
  });

  it('throws when generating tokens for user without id during login', async () => {
    const plainPassword = 'StrongPass123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const user = new User('test@example.com', passwordHash, 'User', false);
    repository.findByEmail.mockResolvedValue(user);

    await expect(
      service.login('test@example.com', plainPassword),
    ).rejects.toThrow('User id is required to generate tokens');
  });

  it('uses seconds parser for refresh token expiry in minutes format', async () => {
    const plainPassword = 'StrongPass123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const user = new User('test@example.com', passwordHash, 'User', false);
    user.id = 'user-1';
    repository.findByEmail.mockResolvedValue(user);

    const moduleRef = await Test.createTestingModule({
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
                'auth.jwtRefreshExpiresIn': '15m',
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
        {
          provide: DemoSeedService,
          useValue: demoSeedService,
        },
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    const localService = moduleRef.get<AuthService>(AuthService);
    await localService.login('test@example.com', plainPassword);

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: 900 }),
    );
  });

  it('uses seconds parser for refresh token expiry in seconds format', async () => {
    const plainPassword = 'StrongPass123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const user = new User('test@example.com', passwordHash, 'User', false);
    user.id = 'user-1';
    repository.findByEmail.mockResolvedValue(user);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: repository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const map: Record<string, string> = {
                'auth.jwtRefreshSecret': 'refresh-secret',
                'auth.jwtRefreshExpiresIn': '45s',
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
        { provide: DemoSeedService, useValue: demoSeedService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    const localService = moduleRef.get<AuthService>(AuthService);
    await localService.login('test@example.com', plainPassword);

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: 45 }),
    );
  });

  it('uses seconds parser for refresh token expiry in hours format', async () => {
    const plainPassword = 'StrongPass123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const user = new User('test@example.com', passwordHash, 'User', false);
    user.id = 'user-1';
    repository.findByEmail.mockResolvedValue(user);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: repository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const map: Record<string, string> = {
                'auth.jwtRefreshSecret': 'refresh-secret',
                'auth.jwtRefreshExpiresIn': '2h',
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
        { provide: DemoSeedService, useValue: demoSeedService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    const localService = moduleRef.get<AuthService>(AuthService);
    await localService.login('test@example.com', plainPassword);

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: 7200 }),
    );
  });

  it('falls back to default refresh expiry when format is invalid', async () => {
    const plainPassword = 'StrongPass123!';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const user = new User('test@example.com', passwordHash, 'User', false);
    user.id = 'user-1';
    repository.findByEmail.mockResolvedValue(user);

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: repository },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: string) => {
              const map: Record<string, string> = {
                'auth.jwtRefreshSecret': 'refresh-secret',
                'auth.jwtRefreshExpiresIn': 'foo',
              };
              return map[key] ?? defaultValue;
            }),
          },
        },
        { provide: DemoSeedService, useValue: demoSeedService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    const localService = moduleRef.get<AuthService>(AuthService);
    await localService.login('test@example.com', plainPassword);

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ expiresIn: 604800 }),
    );
  });
});
