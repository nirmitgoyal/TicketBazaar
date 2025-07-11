/**
 * Modernized WebSocket Service - Server Side
 * 
 * This service handles WebSocket connections with proper dependency injection
 * and clean architecture principles.
 */

import { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { WebSocketEvent, WebSocketEventType } from '../websocket.service';
import { logger } from '../core/logger';

export class ModernizedWebSocketService implements IService {
  readonly name = 'WebSocketService';
  
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, WebSocketClient & { ws: WebSocket }>();
  private eventHandlers = new Map<WebSocketEventType, Set<(event: WebSocketEvent) => void>>();

  /**
   * Initialize WebSocket server
   */
  initialize(server: Server): void {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
    });

    this.setupWebSocketServer();
    logger.info('WebSocket server initialized', { path: '/ws' });
  }

  /**
   * Shutdown WebSocket server
   */
  async shutdown(): Promise<void> {
    if (this.wss) {
      this.wss.close(() => {
        logger.info('WebSocket server closed');
      });
    }
    
    this.clients.clear();
    this.eventHandlers.clear();
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: WebSocketEvent): void {
    const message = JSON.stringify(event);
    
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    logger.debug('Broadcasted event', { 
      type: event.type, 
      clientCount: this.clients.size 
    });
  }

  /**
   * Send event to specific user
   */
  sendToUser(userId: number, event: WebSocketEvent): void {
    const userClients = Array.from(this.clients.values())
      .filter(client => client.userId === userId);

    if (userClients.length === 0) {
      logger.warn('No connected clients for user', { userId });
      return;
    }

    const message = JSON.stringify(event);
    
    userClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });

    logger.debug('Sent event to user', { 
      userId, 
      type: event.type, 
      clientCount: userClients.length 
    });
  }

  /**
   * Send event to multiple users
   */
  sendToUsers(userIds: number[], event: WebSocketEvent): void {
    userIds.forEach(userId => this.sendToUser(userId, event));
  }

  /**
   * Subscribe to WebSocket events
   */
  subscribe(eventType: WebSocketEventType, handler: (event: WebSocketEvent) => void): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    const handlers = this.eventHandlers.get(eventType)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    };
  }

  /**
   * Get connected client count
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get connected users count
   */
  getConnectedUserCount(): number {
    const uniqueUsers = new Set(
      Array.from(this.clients.values())
        .map(client => client.userId)
        .filter(userId => userId !== undefined)
    );
    return uniqueUsers.size;
  }

  /**
   * Setup WebSocket server event handlers
   */
  private setupWebSocketServer(): void {
    if (!this.wss) return;

    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = this.generateClientId();
      const client: WebSocketClient & { ws: WebSocket } = {
        id: clientId,
        connectedAt: new Date(),
        ws,
      };

      this.clients.set(clientId, client);

      logger.info('WebSocket client connected', { 
        clientId, 
        totalClients: this.clients.size 
      });

      // Handle messages
      ws.on('message', (data) => {
        try {
          const event: WebSocketEvent = JSON.parse(data.toString());
          this.handleClientEvent(clientId, event);
        } catch (error) {
          logger.error('Failed to parse WebSocket message', { 
            clientId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info('WebSocket client disconnected', { 
          clientId, 
          totalClients: this.clients.size 
        });
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error('WebSocket client error', { 
          clientId, 
          error: error.message 
        });
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        payload: { clientId },
        timestamp: new Date(),
      }));
    });
  }

  /**
   * Handle events from clients
   */
  private handleClientEvent(clientId: string, event: WebSocketEvent): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Handle authentication events
    if (event.type === 'authenticate' && event.payload?.userId) {
      client.userId = event.payload.userId;
      logger.info('WebSocket client authenticated', { 
        clientId, 
        userId: client.userId 
      });
    }

    // Emit event to subscribers
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          logger.error('Error in WebSocket event handler', { 
            eventType: event.type, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      });
    }
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const webSocketService = new ModernizedWebSocketService();