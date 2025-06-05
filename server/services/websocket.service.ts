import { Server } from "http";
import WebSocket, { WebSocketServer } from "ws";

/**
 * Event types for WebSocket notifications
 */
export enum WebSocketEventType {
  TICKET_CREATED = "ticket_created",
  TICKET_UPDATED = "ticket_updated",
  TICKET_SOLD = "ticket_sold",
  TRANSACTION_CREATED = "transaction_created",
  TRANSACTION_STATUS_UPDATED = "transaction_status_updated",
  DISPUTE_CREATED = "dispute_created",
  DISPUTE_UPDATED = "dispute_updated",
  NOTIFICATION = "notification",
}

/**
 * WebSocket event interface
 */
export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
}

/**
 * WebSocket service for sending real-time notifications to clients
 */
export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, { ws: WebSocket; userId?: number }> = new Map();

  /**
   * Constructor
   * @param server HTTP server to attach WebSocket server to
   */
  constructor(server: Server) {
    // Create WebSocket server with dedicated path to avoid conflicts with Vite HMR
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
    });

    this.setupWebSocketServer();
    console.log("WebSocket server initialized");
  }

  /**
   * Setup WebSocket server and event handlers
   */
  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws, req) => {
      // Generate a unique client ID
      const clientId = this.generateClientId();
      console.log(`WebSocket client connected: ${clientId}`);

      // Add client to clients map
      this.clients.set(clientId, { ws });

      // Handle messages from client
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());

          // Handle authentication message
          if (data.type === "authenticate" && data.userId) {
            this.authenticateClient(clientId, parseInt(data.userId));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      });

      // Handle client disconnect
      ws.on("close", () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });
    });
  }

  /**
   * Generate a unique client ID
   * @returns Unique client ID
   */
  private generateClientId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Authenticate a client
   * @param clientId Client ID
   * @param userId User ID
   */
  private authenticateClient(clientId: string, userId: number): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.userId = userId;
      this.clients.set(clientId, client);
      console.log(
        `WebSocket client authenticated: ${clientId} as user ${userId}`,
      );
    }
  }

  /**
   * Send an event to a specific client
   * @param clientId Client ID
   * @param event WebSocket event
   */
  public sendToClient(clientId: string, event: WebSocketEvent): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(event));
    }
  }

  /**
   * Send an event to a specific user (all their connections)
   * @param userId User ID
   * @param event WebSocket event
   */
  public sendToUser(userId: number, event: WebSocketEvent): void {
    // Get all client entries and iterate through them
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(event));
      }
    });
  }

  /**
   * Broadcast an event to all connected clients
   * @param event WebSocket event
   */
  public broadcast(event: WebSocketEvent): void {
    // Get all client entries and iterate through them
    this.clients.forEach((client, clientId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(event));
      }
    });
  }

  /**
   * Send a notification to a specific user
   * @param userId User ID
   * @param message Notification message
   */
  public notifyUser(userId: number, message: string): void {
    this.sendToUser(userId, {
      type: WebSocketEventType.NOTIFICATION,
      payload: { message },
    });
  }

  /**
   * Send a ticket update notification
   * @param ticketId Ticket ID
   * @param userId User ID (seller)
   * @param status New ticket status
   */
  public notifyTicketUpdate(
    ticketId: number,
    userId: number,
    status: string,
  ): void {
    this.sendToUser(userId, {
      type: WebSocketEventType.TICKET_UPDATED,
      payload: { ticketId, status },
    });
  }

  /**
   * Send a transaction update notification
   * @param transactionId Transaction ID
   * @param buyerId Buyer user ID
   * @param sellerId Seller user ID
   * @param status New transaction status
   */
  public notifyTransactionUpdate(
    transactionId: number,
    buyerId: number,
    sellerId: number,
    status: string,
  ): void {
    const event = {
      type: WebSocketEventType.TRANSACTION_STATUS_UPDATED,
      payload: { transactionId, status },
    };

    // Notify both buyer and seller
    this.sendToUser(buyerId, event);
    this.sendToUser(sellerId, event);
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  getActiveConnectionCount(): number {
    let activeCount = 0;
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        activeCount++;
      }
    });
    return activeCount;
  }
}

// Export the global instance and convenience functions
let webSocketServiceInstance: WebSocketService | null = null;

export function initializeWebSocketService(server: Server): WebSocketService {
  webSocketServiceInstance = new WebSocketService(server);
  return webSocketServiceInstance;
}

export function getWebSocketService(): WebSocketService | null {
  return webSocketServiceInstance;
}

export function broadcastToAll(data: any): void {
  if (webSocketServiceInstance) {
    webSocketServiceInstance.broadcast({
      type: data.type as WebSocketEventType,
      payload: data
    });
  }
}

// Alias for backward compatibility
export const setupWebSocket = initializeWebSocketService;