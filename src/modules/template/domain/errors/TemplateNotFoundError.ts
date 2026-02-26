/**
 * Domain error thrown when a template is not found for a given event type.
 * This is a business logic error indicating no template was configured for the event.
 */
export class TemplateNotFoundError extends Error {
  constructor(eventType: string) {
    super(`Template not found for event type: ${eventType}`);
    this.name = 'TemplateNotFoundError';
  }
}
