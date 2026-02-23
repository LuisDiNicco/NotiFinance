import { IsString, MinLength } from 'class-validator';
import { NotificationTemplate } from '../../../../../domain/entities/NotificationTemplate';

export class TemplateRequest {
    @IsString()
    @MinLength(2)
    name!: string;

    @IsString()
    @MinLength(2)
    eventType!: string;

    @IsString()
    @MinLength(5)
    subjectTemplate!: string;

    @IsString()
    @MinLength(5)
    bodyTemplate!: string;

    /**
     * Converts the request DTO to a domain entity.
     * Ensures proper validation and type conversion before business logic processing.
     */
    toEntity(): NotificationTemplate {
        return new NotificationTemplate(
            this.name,
            this.eventType,
            this.subjectTemplate,
            this.bodyTemplate,
        );
    }
}
