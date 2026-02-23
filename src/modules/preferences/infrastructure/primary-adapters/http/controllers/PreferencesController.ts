import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PreferencesService } from '../../../../application/PreferencesService';
import { PreferencesRequest } from './request/PreferencesRequest';
import { UserPreferenceResponse } from '../responses/UserPreferenceResponse';

@ApiTags('preferences')
@Controller('preferences')
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) { }

    @Get(':userId')
    @ApiOperation({ summary: 'Get user notification preferences' })
    @ApiResponse({
        status: 200,
        description: 'Preferences retrieved successfully',
        type: UserPreferenceResponse,
    })
    @ApiResponse({ status: 404, description: 'User preferences not found' })
    async getPreferences(@Param('userId') userId: string): Promise<UserPreferenceResponse> {
        const prefs = await this.preferencesService.getPreferences(userId);
        return UserPreferenceResponse.fromEntity(prefs);
    }

    @Post()
    @ApiOperation({ summary: 'Create or update user notification preferences' })
    @ApiResponse({
        status: 201,
        description: 'Preferences saved successfully',
        type: UserPreferenceResponse,
    })
    async updatePreferences(@Body() payload: PreferencesRequest): Promise<UserPreferenceResponse> {
        const entity = payload.toEntity();
        const saved = await this.preferencesService.createOrUpdatePreferences(
            entity.userId,
            entity.optInChannels,
            entity.disabledEventTypes,
        );
        return UserPreferenceResponse.fromEntity(saved);
    }
}
