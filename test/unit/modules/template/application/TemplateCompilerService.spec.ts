import { Test, TestingModule } from '@nestjs/testing';
import { TemplateCompilerService } from '../../../../../src/modules/template/application/TemplateCompilerService';
import { ITemplateRepository, TEMPLATE_REPO } from '../../../../../src/modules/template/application/ITemplateRepository';
import { NotificationTemplate } from '../../../../../src/modules/template/domain/entities/NotificationTemplate';
import { TemplateNotFoundError } from '../../../../../src/modules/template/domain/errors/TemplateNotFoundError';

describe('TemplateCompilerService', () => {
    let service: TemplateCompilerService;
    let repo: jest.Mocked<ITemplateRepository>;

    beforeEach(async () => {
        repo = {
            findByEventType: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TemplateCompilerService,
                { provide: TEMPLATE_REPO, useValue: repo },
            ],
        }).compile();

        service = module.get<TemplateCompilerService>(TemplateCompilerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should compile templates properly replacing nested and flat variables', async () => {
        repo.findByEventType.mockResolvedValue(
            new NotificationTemplate('Test', 'test.event', 'Hello {{ user.name }}', 'Your total is {{ amount }} with status {{status}}')
        );

        const result = await service.compileTemplate('test.event', {
            user: { name: 'Luis' },
            amount: 42,
            status: 'OK'
        });

        expect(result.subject).toBe('Hello Luis');
        expect(result.body).toBe('Your total is 42 with status OK');
    });

    it('should ignore unresolvable variables and swap them out as empty string', async () => {
        repo.findByEventType.mockResolvedValue(
            new NotificationTemplate('Test', 'test.event', 'Hello {{ wrong_key }}', 'Body')
        );
        const result = await service.compileTemplate('test.event', { user: 'hi' });
        expect(result.subject).toBe('Hello ');
    });

    it('should throw TemplateNotFoundError if template does not exist', async () => {
        repo.findByEventType.mockResolvedValue(null);
        await expect(service.compileTemplate('unknown', {})).rejects.toThrow(TemplateNotFoundError);
    });
});
