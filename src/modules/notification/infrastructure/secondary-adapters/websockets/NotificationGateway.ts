import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';
import { NotificationDispatchPayload } from '../../../application/services/IChannelProvider';

@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly configService: ConfigService) {}

  private extractToken(client: Socket): string | null {
    const authPayload = client.handshake.auth as
      | Record<string, unknown>
      | undefined;
    const authToken = authPayload?.['token'];
    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const headerAuthorization = client.handshake.headers['authorization'];
    if (typeof headerAuthorization !== 'string') {
      return null;
    }

    const match = headerAuthorization.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
  }

  private resolveUserIdFromToken(token: string): string | null {
    const secret = this.configService.get<string>('auth.jwtSecret');
    if (!secret) {
      this.logger.error('Missing auth.jwtSecret for notifications gateway');
      return null;
    }

    try {
      const decoded = verify(token, secret);
      if (typeof decoded === 'string') {
        return null;
      }

      return typeof decoded.sub === 'string' ? decoded.sub : null;
    } catch {
      return null;
    }
  }

  handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.warn(`Client ${client.id} disconnected: missing token`);
      client.disconnect(true);
      return;
    }

    const userId = this.resolveUserIdFromToken(token);
    if (!userId) {
      this.logger.warn(`Client ${client.id} disconnected: invalid token`);
      client.disconnect(true);
      return;
    }

    void client.join(`user:${userId}`);
    this.logger.log(
      `Client ${client.id} connected and joined room user:${userId}`,
    );
  }

  @SubscribeMessage('subscribe')
  public handleSubscribe(): void {
    // Auto-subscription is handled on connect after JWT validation.
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  public emitNotification(
    userId: string,
    payload: NotificationDispatchPayload,
    correlationId: string,
  ) {
    this.server.to(`user:${userId}`).emit('notification:new', {
      id: payload.id,
      title: payload.title,
      body: payload.body,
      type: payload.type,
      metadata: payload.metadata,
      createdAt: payload.createdAt,
    });
    this.logger.log(
      `[Trace: ${correlationId}] Emitted 'notification:new' via WS to user:${userId}`,
    );
  }

  public emitNotificationCount(
    userId: string,
    unreadCount: number,
    correlationId: string,
  ) {
    this.server.to(`user:${userId}`).emit('notification:count', {
      unreadCount,
    });
    this.logger.log(
      `[Trace: ${correlationId}] Emitted 'notification:count' (${unreadCount}) to user:${userId}`,
    );
  }
}
