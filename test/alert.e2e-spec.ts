import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AlertController } from '../src/modules/alert/infrastructure/primary-adapters/http/controllers/AlertController';
import { AlertService } from '../src/modules/alert/application/AlertService';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { Alert } from '../src/modules/alert/domain/entities/Alert';
import { AlertCondition } from '../src/modules/alert/domain/enums/AlertCondition';
import { AlertStatus } from '../src/modules/alert/domain/enums/AlertStatus';
import { AlertType } from '../src/modules/alert/domain/enums/AlertType';
import { NotificationChannel } from '../src/modules/preferences/domain/enums/NotificationChannel';

describe('Alert endpoints (e2e)', () => {
  let app: INestApplication;

  const baseAlert = new Alert({
    userId: 'user-1',
    assetId: '11111111-1111-4111-8111-111111111111',
    alertType: AlertType.PRICE,
    condition: AlertCondition.ABOVE,
    threshold: 100,
    channels: [NotificationChannel.IN_APP],
    isRecurring: true,
    status: AlertStatus.ACTIVE,
  });
  baseAlert.id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  const alertServiceMock = {
    createAlert: jest.fn().mockResolvedValue(baseAlert),
    getUserAlerts: jest.fn().mockResolvedValue([baseAlert]),
    updateAlert: jest.fn().mockResolvedValue(baseAlert),
    changeStatus: jest.fn().mockResolvedValue(baseAlert),
    deleteAlert: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AlertController],
      providers: [
        {
          provide: AlertService,
          useValue: alertServiceMock,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { sub: 'user-1' };
          return true;
        },
      })
      .compile();

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

  it('/alerts (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/alerts')
      .send({
        assetId: '11111111-1111-4111-8111-111111111111',
        alertType: 'PRICE',
        condition: 'ABOVE',
        threshold: 100,
        channels: ['IN_APP'],
        isRecurring: true,
      })
      .expect(201);

    expect(response.body.id).toBe(baseAlert.id);
  });

  it('/alerts (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/alerts')
      .expect(200);
    expect(response.body).toHaveLength(1);
  });

  it('/alerts/:id (PATCH)', async () => {
    await request(app.getHttpServer())
      .patch(`/alerts/${baseAlert.id}`)
      .send({ threshold: 110 })
      .expect(200);
  });

  it('/alerts/:id/status (PATCH)', async () => {
    await request(app.getHttpServer())
      .patch(`/alerts/${baseAlert.id}/status`)
      .send({ status: 'PAUSED' })
      .expect(200);
  });

  it('/alerts/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete(`/alerts/${baseAlert.id}`)
      .expect(200);
  });
});
