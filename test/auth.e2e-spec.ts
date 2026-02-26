import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from '../src/modules/auth/infrastructure/primary-adapters/http/controllers/AuthController';
import { AuthService } from '../src/modules/auth/application/AuthService';
import { User } from '../src/modules/auth/domain/entities/User';

const buildUser = (id: string, email: string, isDemo = false): User => {
  const user = new User(email, 'hash', 'Test User', isDemo);
  user.id = id;
  return user;
};

describe('Auth endpoints (e2e)', () => {
  let app: INestApplication;

  const authServiceMock = {
    register: jest.fn().mockResolvedValue({
      user: buildUser('user-1', 'user@example.com'),
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    }),
    login: jest.fn().mockResolvedValue({
      user: buildUser('user-1', 'user@example.com'),
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    }),
    refreshToken: jest.fn().mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }),
    createDemoSession: jest.fn().mockResolvedValue({
      user: buildUser('demo-1', 'demo@example.com', true),
      tokens: { accessToken: 'demo-token', refreshToken: 'demo-refresh' },
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) validates and returns auth payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Password123!',
        displayName: 'User Name',
      })
      .expect(201);

    expect(response.body.user.email).toBe('user@example.com');
    expect(response.body.accessToken).toBe('access-token');
  });

  it('/auth/login (POST) returns auth payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'Password123!',
      })
      .expect(200);

    expect(response.body.user.id).toBe('user-1');
  });

  it('/auth/refresh (POST) returns refreshed tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'token-value-with-min-length-20' })
      .expect(200);

    expect(response.body.accessToken).toBe('new-access-token');
  });

  it('/auth/demo (POST) creates demo session', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/demo')
      .expect(201);

    expect(response.body.user.isDemo).toBe(true);
    expect(response.body.accessToken).toBe('demo-token');
  });
});
