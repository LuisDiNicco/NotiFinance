import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AlertStatus } from '../../../../../domain/enums/AlertStatus';

export class ChangeAlertStatusRequest {
    @ApiProperty({ enum: AlertStatus })
    @IsEnum(AlertStatus)
    public readonly status!: AlertStatus;
}
