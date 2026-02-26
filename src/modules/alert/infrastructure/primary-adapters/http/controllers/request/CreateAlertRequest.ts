import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Alert } from '../../../../../domain/entities/Alert';
import { AlertCondition } from '../../../../../domain/enums/AlertCondition';
import { AlertStatus } from '../../../../../domain/enums/AlertStatus';
import { AlertType } from '../../../../../domain/enums/AlertType';
import { NotificationChannel } from '../../../../../../preferences/domain/enums/NotificationChannel';

export class CreateAlertRequest {
  @ApiPropertyOptional({
    description: 'Optional asset id for asset-scoped alerts',
  })
  @IsOptional()
  @IsUUID()
  public readonly assetId?: string;

  @ApiProperty({ enum: AlertType })
  @IsEnum(AlertType)
  public readonly alertType!: AlertType;

  @ApiProperty({ enum: AlertCondition })
  @IsEnum(AlertCondition)
  public readonly condition!: AlertCondition;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  public readonly threshold!: number;

  @ApiPropertyOptional({
    example: 'MEP',
    description: 'Period or subtype marker (e.g. dollar type)',
  })
  @IsOptional()
  @IsString()
  public readonly period?: string;

  @ApiProperty({ type: [String], enum: NotificationChannel })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  public readonly channels!: NotificationChannel[];

  @ApiProperty({ example: true })
  @IsBoolean()
  public readonly isRecurring!: boolean;

  public toEntity(userId: string): Alert {
    return new Alert({
      userId,
      assetId: this.assetId ?? null,
      alertType: this.alertType,
      condition: this.condition,
      threshold: this.threshold,
      period: this.period ?? null,
      channels: this.channels,
      isRecurring: this.isRecurring,
      status: AlertStatus.ACTIVE,
    });
  }
}
