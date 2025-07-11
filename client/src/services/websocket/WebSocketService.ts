/**
 * WebSocket Service - Client Side
 * 
 * This service handles WebSocket connections and real-time communication
 * with the server. It provides a clean API for components to subscribe
 * to real-time events.
 */

import { WebSocketEvent, WebSocketEventType } from '@ticketbazaar/types';

export type WebSocketEventHandler = (event: WebSocketEvent) => void;

export interface WebSocketServiceInterface {
  connect(): Promise<void>;
  disconnect(): void;
  send(event: WebSocketEvent): void;
  subscribe(eventType: WebSocketEventType, handler: WebSocketEventHandler): () => void;
  isConnected(): boolean;
}

export class WebSocketService implements WebSocketServiceInterface {
  private ws: WebSocket | null = null;
  private eventHandlers = new Map<WebSocketEventType, Set<WebSocketEventHandler>>();
  private connectionPromise: Promise<void> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to server');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data);
          this.handleEvent(data);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        this.ws = null;
        this.connectionPromise = null;
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Connection error:', error);
        reject(error);
      };
    });

    return this.connectionPromise;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionPromise = null;
    this.eventHandlers.clear();
  }

  /**
   * Send event to server
   */
  send(event: WebSocketEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send event, connection not open');
      return;
    }

    this.ws.send(JSON.stringify(event));
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(eventType: WebSocketEventType, handler: WebSocketEventHandler): () => void {
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
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming events
   */
  private handleEvent(event: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`[WebSocket] Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect().catch((error) => {
          console.error('[WebSocket] Reconnect failed:', error);
        });
      }
    }, delay);
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();