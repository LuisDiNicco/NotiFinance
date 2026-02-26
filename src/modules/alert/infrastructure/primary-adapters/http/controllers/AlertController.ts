import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AlertService } from '../../../../application/AlertService';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { Alert } from '../../../../domain/entities/Alert';
import { CreateAlertRequest } from './request/CreateAlertRequest';
import { UpdateAlertRequest } from './request/UpdateAlertRequest';
import { ChangeAlertStatusRequest } from './request/ChangeAlertStatusRequest';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Throttle({ authenticated: { limit: 300, ttl: 60000 } })
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @ApiOperation({ summary: 'Create alert for authenticated user' })
  @ApiResponse({ status: 201 })
  public async createAlert(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateAlertRequest,
  ): Promise<Alert> {
    return this.alertService.createAlert(
      req.user.sub,
      payload.toEntity(req.user.sub),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get authenticated user alerts' })
  @ApiResponse({ status: 200 })
  public async getUserAlerts(
    @Req() req: AuthenticatedRequest,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{
    data: Alert[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const [data, total] = await Promise.all([
      this.alertService.getUserAlerts(req.user.sub, parsedPage, parsedLimit),
      this.alertService.getUserAlertsTotal(req.user.sub),
    ]);

    return {
      data,
      meta: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / parsedLimit)),
      },
    };
  }

  @Get(':alertId')
  @ApiOperation({ summary: 'Get alert detail' })
  @ApiParam({ name: 'alertId' })
  @ApiResponse({ status: 200 })
  public async getAlertById(
    @Req() req: AuthenticatedRequest,
    @Param('alertId') alertId: string,
  ): Promise<Alert> {
    return this.alertService.getUserAlertById(req.user.sub, alertId);
  }

  @Patch(':alertId')
  @ApiOperation({ summary: 'Update alert' })
  @ApiParam({ name: 'alertId' })
  @ApiResponse({ status: 200 })
  public async updateAlert(
    @Req() req: AuthenticatedRequest,
    @Param('alertId') alertId: string,
    @Body() payload: UpdateAlertRequest,
  ): Promise<Alert> {
    return this.alertService.updateAlert(req.user.sub, alertId, payload);
  }

  @Patch(':alertId/status')
  @ApiOperation({ summary: 'Change alert status' })
  @ApiParam({ name: 'alertId' })
  @ApiResponse({ status: 200 })
  public async changeStatus(
    @Req() req: AuthenticatedRequest,
    @Param('alertId') alertId: string,
    @Body() payload: ChangeAlertStatusRequest,
  ): Promise<Alert> {
    return this.alertService.changeStatus(
      req.user.sub,
      alertId,
      payload.status,
    );
  }

  @Delete(':alertId')
  @ApiOperation({ summary: 'Delete alert' })
  @ApiParam({ name: 'alertId' })
  @ApiResponse({ status: 204 })
  public async deleteAlert(
    @Req() req: AuthenticatedRequest,
    @Param('alertId') alertId: string,
  ): Promise<void> {
    await this.alertService.deleteAlert(req.user.sub, alertId);
  }
}
