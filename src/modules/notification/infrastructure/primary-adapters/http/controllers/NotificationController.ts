import {
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { NotificationService } from '../../../../application/services/NotificationService';
import { Notification } from '../../../../domain/entities/Notification';

interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
    };
}

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiResponse({ status: 200 })
    public async getNotifications(
        @Req() req: AuthenticatedRequest,
        @Query('unreadOnly') unreadOnly = 'false',
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ): Promise<Notification[]> {
        return this.notificationService.getUserNotifications(
            req.user.sub,
            unreadOnly === 'true',
            Number(page),
            Number(limit),
        );
    }

    @Get('count')
    @ApiOperation({ summary: 'Get unread notification count' })
    @ApiResponse({ status: 200 })
    public async getUnreadCount(@Req() req: AuthenticatedRequest): Promise<{ unread: number }> {
        const unread = await this.notificationService.getUnreadCount(req.user.sub);
        return { unread };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark one notification as read' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200 })
    public async markAsRead(
        @Req() req: AuthenticatedRequest,
        @Param('id') notificationId: string,
    ): Promise<void> {
        await this.notificationService.markAsRead(req.user.sub, notificationId);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({ status: 200 })
    public async markAllAsRead(@Req() req: AuthenticatedRequest): Promise<void> {
        await this.notificationService.markAllAsRead(req.user.sub);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete notification' })
    @ApiParam({ name: 'id' })
    @ApiResponse({ status: 200 })
    public async deleteNotification(
        @Req() req: AuthenticatedRequest,
        @Param('id') notificationId: string,
    ): Promise<void> {
        await this.notificationService.deleteNotification(req.user.sub, notificationId);
    }
}
