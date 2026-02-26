import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    client.on('join', (userId: string) => {
      void client.join(`user-${userId}`);
      this.logger.log(`Client ${client.id} joined room user-${userId}`);
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  public emitNotification(
    userId: string,
    subject: string,
    body: string,
    correlationId: string,
  ) {
    this.server.to(`user-${userId}`).emit('new_notification', {
      subject,
      body,
      correlationId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(
      `[Trace: ${correlationId}] Emitted 'new_notification' via WS to user-${userId}`,
    );
  }
}
