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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../../../auth/infrastructure/primary-adapters/http/guards/JwtAuthGuard';
import { NotificationService } from '../../../../application/services/NotificationService';
import { Notification } from '../../../../domain/entities/Notification';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
  };
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Throttle({ authenticated: { limit: 300, ttl: 60000 } })
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200 })
  public async getNotifications(
    @Req() req: AuthenticatedRequest,
    @Query('unreadOnly') unreadOnly = 'false',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<{
    data: Notification[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const unread = unreadOnly === 'true';
    const [data, total] = await Promise.all([
      this.notificationService.getUserNotifications(
        req.user.sub,
        unread,
        parsedPage,
        parsedLimit,
      ),
      this.notificationService.getUserNotificationsTotal(req.user.sub, unread),
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

  @Get('count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200 })
  public async getUnreadCount(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notificationService.getUnreadCount(
      req.user.sub,
    );
    return { unreadCount };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark one notification as read' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ): Promise<{ id: string; isRead: boolean; readAt: string | null } | null> {
    const notification = await this.notificationService.markAsRead(
      req.user.sub,
      notificationId,
    );

    if (!notification) {
      return null;
    }

    return {
      id: notification.id ?? notificationId,
      isRead: notification.isRead,
      readAt: notification.readAt?.toISOString() ?? null,
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200 })
  public async markAllAsRead(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ updatedCount: number }> {
    const updatedCount = await this.notificationService.markAllAsRead(
      req.user.sub,
    );
    return { updatedCount };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200 })
  public async deleteNotification(
    @Req() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ): Promise<void> {
    await this.notificationService.deleteNotification(
      req.user.sub,
      notificationId,
    );
  }
}
