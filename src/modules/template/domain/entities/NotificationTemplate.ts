export class NotificationTemplate {
    public id?: string;
    public name: string;
    public eventType: string;
    public subjectTemplate: string;
    public bodyTemplate: string;

    constructor(
        name: string,
        eventType: string,
        subjectTemplate: string,
        bodyTemplate: string,
    ) {
        this.name = name;
        this.eventType = eventType;
        this.subjectTemplate = subjectTemplate;
        this.bodyTemplate = bodyTemplate;
    }
}
