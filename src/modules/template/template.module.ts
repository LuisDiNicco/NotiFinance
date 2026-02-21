import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplateEntity } from './infrastructure/secondary-adapters/database/entities/NotificationTemplateEntity';
import { TemplateController } from './infrastructure/primary-adapters/http/controllers/TemplateController';
import { TemplateCompilerService } from './application/TemplateCompilerService';
import { TemplateRepository } from './infrastructure/secondary-adapters/database/repositories/TemplateRepository';
import { TEMPLATE_REPO } from './application/ITemplateRepository';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationTemplateEntity])],
    controllers: [TemplateController],
    providers: [
        TemplateCompilerService,
        {
            provide: TEMPLATE_REPO,
            useClass: TemplateRepository,
        },
    ],
    exports: [TemplateCompilerService],
})
export class TemplateModule { }
