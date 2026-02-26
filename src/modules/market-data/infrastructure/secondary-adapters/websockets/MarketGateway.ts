import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DollarQuote } from '../../../domain/entities/DollarQuote';
import { CountryRisk } from '../../../domain/entities/CountryRisk';

@WebSocketGateway({
  namespace: '/market',
  cors: { origin: '*' },
})
@Injectable()
export class MarketGateway {
  @WebSocketServer()
  public server!: Server;

  private readonly logger = new Logger(MarketGateway.name);

  private get socketServer(): Server | null {
    if (!this.server) {
      return null;
    }

    return this.server;
  }

  public emitDollar(payload: DollarQuote[]): void {
    const server = this.socketServer;
    if (!server) {
      return;
    }

    server.emit('market:dollar', payload);
    this.logger.log(`Emitted market:dollar to ${payload.length} quotes`);
  }

  public emitRisk(payload: CountryRisk): void {
    const server = this.socketServer;
    if (!server) {
      return;
    }

    server.emit('market:risk', payload);
    this.logger.log('Emitted market:risk');
  }

  public emitQuoteUpdated(payload: {
    scope: string;
    updatedCount: number;
    refreshedAt: string;
  }): void {
    const server = this.socketServer;
    if (!server) {
      return;
    }

    server.emit('market:quote', payload);
    this.logger.log(
      `Emitted market:quote for ${payload.scope} (${payload.updatedCount})`,
    );
  }
}
