import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PreferencesService } from '../../../../application/PreferencesService';
import { PreferencesRequest } from './request/PreferencesRequest';

@Controller('preferences')
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) { }

    @Get(':userId')
    async getPreferences(@Param('userId') userId: string) {
        return this.preferencesService.getPreferences(userId);
    }

    @Post()
    async updatePreferences(@Body() payload: PreferencesRequest) {
        return this.preferencesService.createOrUpdatePreferences(
            payload.userId,
            payload.optInChannels,
            payload.disabledEventTypes,
        );
    }
}
