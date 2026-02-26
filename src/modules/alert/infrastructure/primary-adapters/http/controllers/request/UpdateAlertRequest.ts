import { ApiPropertyOptional } from '@nestjs/swagger';
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
import { AlertCondition } from '../../../../../domain/enums/AlertCondition';
import { AlertType } from '../../../../../domain/enums/AlertType';
import { NotificationChannel } from '../../../../../../preferences/domain/enums/NotificationChannel';

export class UpdateAlertRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  public readonly assetId?: string;

  @ApiPropertyOptional({ enum: AlertType })
  @IsOptional()
  @IsEnum(AlertType)
  public readonly alertType?: AlertType;

  @ApiPropertyOptional({ enum: AlertCondition })
  @IsOptional()
  @IsEnum(AlertCondition)
  public readonly condition?: AlertCondition;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  public readonly threshold?: number;

  @ApiPropertyOptional({ example: 'MEP' })
  @IsOptional()
  @IsString()
  public readonly period?: string;

  @ApiPropertyOptional({ type: [String], enum: NotificationChannel })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  public readonly channels?: NotificationChannel[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  public readonly isRecurring?: boolean;
}
