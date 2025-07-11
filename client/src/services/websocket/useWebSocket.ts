/**
 * useWebSocket Hook
 * 
 * This hook provides WebSocket functionality to React components.
 * It handles connection management and event subscriptions.
 */

import { useEffect, useCallback, useState } from 'react';
import { WebSocketEvent, WebSocketEventType } from '@shared/unified-types';
import { webSocketService, WebSocketEventHandler } from './WebSocketService';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectOnMount?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, reconnectOnMount = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    try {
      await webSocketService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
  }, []);

  // Send event
  const send = useCallback((event: WebSocketEvent) => {
    webSocketService.send(event);
  }, []);

  // Subscribe to events
  const subscribe = useCallback((eventType: WebSocketEventType, handler: WebSocketEventHandler) => {
    return webSocketService.subscribe(eventType, handler);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (reconnectOnMount) {
        disconnect();
      }
    };
  }, [autoConnect, reconnectOnMount, connect, disconnect]);

  // Update connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    send,
    subscribe,
  };
}

/**
 * useWebSocketEvent Hook
 * 
 * This hook subscribes to a specific WebSocket event type.
 */
export function useWebSocketEvent(
  eventType: WebSocketEventType,
  handler: WebSocketEventHandler,
  dependencies: React.DependencyList = []
) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe(eventType, handler);
    return unsubscribe;
  }, [eventType, subscribe, ...dependencies]);
}