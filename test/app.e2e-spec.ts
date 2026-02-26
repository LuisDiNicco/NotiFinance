import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { TemplateController } from '../src/modules/template/infrastructure/primary-adapters/http/controllers/TemplateController';
import { TemplateCompilerService } from '../src/modules/template/application/TemplateCompilerService';
import { TEMPLATE_REPO } from '../src/modules/template/application/ITemplateRepository';
import { NotificationTemplate } from '../src/modules/template/domain/entities/NotificationTemplate';

const templateEntity = new NotificationTemplate(
  'Price Alert Template',
  'alert.price.above',
  'Price {{amount}}',
  'Body {{reference}}',
);
templateEntity.id = 'tpl-1';

const templateRepoMock = {
  save: jest.fn().mockImplementation(async (template: NotificationTemplate) => {
    template.id = 'tpl-1';
    return template;
  }),
  findByEventType: jest.fn().mockResolvedValue(templateEntity),
  findPaginated: jest.fn().mockResolvedValue({
    data: [templateEntity],
    total: 1,
    page: 1,
    totalPages: 1,
  }),
};

describe('Templates endpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TemplateController],
      providers: [
        TemplateCompilerService,
        {
          provide: TEMPLATE_REPO,
          useValue: templateRepoMock,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
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

  it('/api/v1/templates (GET) returns paginated shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/templates?page=1&limit=10')
      .expect(200);

    expect(response.body).toMatchObject({
      total: 1,
      page: 1,
      totalPages: 1,
    });
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('/api/v1/templates (POST) stores template', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/templates')
      .send({
        name: 'Price Alert Template',
        eventType: 'alert.price.above',
        subjectTemplate: 'Price {{amount}}',
        bodyTemplate: 'Body {{reference}}',
      })
      .expect(201);

    expect(response.body.id).toBe('tpl-1');
  });

  it('/api/v1/templates/test-compile (POST) compiles context variables', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/templates/test-compile')
      .send({
        eventType: 'alert.price.above',
        context: {
          amount: 100,
          reference: 'TX-01',
        },
      })
      .expect(200);

    expect(response.body).toEqual({
      subject: 'Price 100',
      body: 'Body TX-01',
    });
  });
});
