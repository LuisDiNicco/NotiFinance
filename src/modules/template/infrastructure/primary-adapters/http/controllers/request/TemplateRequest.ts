import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationTemplate } from '../../../../../domain/entities/NotificationTemplate';

export class TemplateRequest {
    @ApiProperty({
        description: 'Human-readable template name',
        example: 'Payment Success Email',
    })
    @IsString()
    @MinLength(2)
    name!: string;

    @ApiProperty({
        description: 'Event type associated with this template',
        example: 'payment.success',
    })
    @IsString()
    @MinLength(2)
    eventType!: string;

    @ApiProperty({
        description: 'Subject template supporting placeholders like {{amount}}',
        example: 'Payment of {{amount}} confirmed',
    })
    @IsString()
    @MinLength(5)
    subjectTemplate!: string;

    @ApiProperty({
        description: 'Body template supporting placeholders like {{reference}}',
        example: 'Reference {{reference}} was processed successfully.',
    })
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
