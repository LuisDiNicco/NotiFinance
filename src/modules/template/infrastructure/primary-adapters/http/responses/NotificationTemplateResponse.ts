import { ApiProperty } from '@nestjs/swagger';
import { NotificationTemplate } from '../../../../domain/entities/NotificationTemplate';

export class NotificationTemplateResponse {
  @ApiProperty({
    description: 'Unique identifier for the template',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Human-readable name for the template',
    example: 'Price Alert Email',
  })
  name!: string;

  @ApiProperty({
    description: 'Event type this template is associated with',
    example: 'alert.price.above',
  })
  eventType!: string;

  @ApiProperty({
    description:
      'Template for the subject line (supports {{key}} placeholders)',
    example: 'GGAL superó {{threshold}}',
  })
  subjectTemplate!: string;

  @ApiProperty({
    description:
      'Template for the message body (supports {{key}} placeholders)',
    example: 'Precio actual {{currentValue}} con umbral {{threshold}}',
  })
  bodyTemplate!: string;

  /**
   * Factory method to convert a domain entity to a response DTO.
   * Ensures domain structure is never leaked directly to client.
   */
  static fromEntity(
    entity: NotificationTemplate,
  ): NotificationTemplateResponse {
    const response = new NotificationTemplateResponse();
    response.id = entity.id || '';
    response.name = entity.name;
    response.eventType = entity.eventType;
    response.subjectTemplate = entity.subjectTemplate;
    response.bodyTemplate = entity.bodyTemplate;
    return response;
  }
}
