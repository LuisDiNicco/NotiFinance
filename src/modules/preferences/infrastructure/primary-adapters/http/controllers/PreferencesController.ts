import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { PreferencesService } from '../../../../application/PreferencesService';
import { PreferencesRequest } from './request/PreferencesRequest';
import { UserPreferenceResponse } from '../responses/UserPreferenceResponse';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('Preferences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Throttle({ authenticated: { limit: 300, ttl: 60000 } })
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get authenticated user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
    type: UserPreferenceResponse,
  })
  @ApiResponse({ status: 404, description: 'User preferences not found' })
  async getPreferences(
    @Req() req: AuthenticatedRequest,
  ): Promise<UserPreferenceResponse> {
    const prefs = await this.preferencesService.getPreferences(req.user.sub);
    return UserPreferenceResponse.fromEntity(prefs);
  }

  @Put()
  @ApiOperation({
    summary: 'Create or update authenticated user notification preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences saved successfully',
    type: UserPreferenceResponse,
  })
  async updatePreferences(
    @Req() req: AuthenticatedRequest,
    @Body() payload: PreferencesRequest,
  ): Promise<UserPreferenceResponse> {
    const entity = payload.toEntity(req.user.sub);
    const saved = await this.preferencesService.createOrUpdatePreferences(
      entity.userId,
      entity.optInChannels,
      entity.disabledEventTypes,
      entity.quietHoursStart,
      entity.quietHoursEnd,
      entity.digestFrequency,
    );
    return UserPreferenceResponse.fromEntity(saved);
  }
}
