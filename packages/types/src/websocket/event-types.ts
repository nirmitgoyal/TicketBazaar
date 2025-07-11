/**
 * WebSocket event types and interfaces
 */

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
  timestamp?: Date;
  userId?: number;
}

/**
 * WebSocket client connection interface
 */
export interface WebSocketClient {
  id: string;
  userId?: number;
  connectedAt: Date;
  lastPing?: Date;
}