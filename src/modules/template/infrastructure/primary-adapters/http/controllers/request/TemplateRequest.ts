import { IsString, MinLength } from 'class-validator';

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
}
