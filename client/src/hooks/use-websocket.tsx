import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { createWebSocketFallback, suppressWebSocketErrors } from "../lib/websocket-fallback";

// Define WebSocket event types
export enum WebSocketEventType {
  NOTIFICATION = "notification",
  TICKET_UPDATED = "ticket_updated",
  TRANSACTION_UPDATED = "transaction_updated",
  DISPUTE_UPDATED = "dispute_updated",
}

// Define WebSocket event interface
export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
}

// Define WebSocketContext interface
interface WebSocketContextValue {
  isConnected: boolean;
  lastMessage: WebSocketEvent | null;
  sendMessage: (event: WebSocketEvent) => void;
}

// Create context
const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// Provider component
export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket fallback and error suppression
    const fallback = createWebSocketFallback();
    if (fallback.shouldSuppressErrors) {
      suppressWebSocketErrors();
    }

    // Only connect when user is authenticated
    if (!user) {
      return;
    }

    // Check if WebSocket is supported in this environment
    if (!fallback.isSupported) {
      console.log("WebSocket not supported in this environment");
      return;
    }

    const connectWebSocket = () => {
      try {
        // Get a reliable host (handle both development and production)
        const host = window.location.host;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

        // Construct WebSocket URL with the /ws path
        const wsUrl = `${protocol}//${host}/ws`;

        console.log(`Attempting WebSocket connection to: ${wsUrl}`);

        // Create a new connection with backoff retry logic
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        return socket;
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        return null;
      }
    };

    // Create the initial connection
    const socket = connectWebSocket();
    if (!socket) return; // Exit if connection failed

    // Implement reconnection logic with exponential backoff
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 2; // Reduce attempts for production

    // Function to handle reconnection with backoff
    const reconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Shorter max delay
        reconnectAttempts++;

        console.log(`WebSocket reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`);

        setTimeout(() => {
          if (user) {
            const newSocket = connectWebSocket();
            // Don't reset reconnection attempts until we get a successful connection
            if (newSocket) {
              // Setup will happen in the normal flow
            }
          }
        }, delay);
      } else {
        console.log("Max WebSocket reconnection attempts reached - continuing without real-time updates");
        // Don't show error toast in production as WebSocket is non-critical
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit')) {
          toast({
            title: "Connection Notice",
            description: "Real-time updates unavailable. App will continue to work normally.",
            variant: "default",
          });
        }
      }
    };

    // Connection opened
    socket.addEventListener("open", () => {
      console.log("WebSocket connection established successfully");
      setIsConnected(true);
      reconnectAttempts = 0; // Reset attempts on successful connection

      // Authenticate with the server
      if (user) {
        socket.send(
          JSON.stringify({
            type: "authenticate",
            userId: user.id,
          }),
        );
      }
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        setLastMessage(data);

        // Handle notifications
        if (data.type === WebSocketEventType.NOTIFICATION) {
          toast({
            title: "Notification",
            description: data.payload.message,
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    // Connection closed
    socket.addEventListener("close", (event) => {
      console.log("WebSocket connection closed", event.code, event.reason);
      setIsConnected(false);

      // Handle different close codes appropriately
      // 1000: Normal closure
      // 1001: Going away (page refresh/navigate)
      // 1006: Abnormal closure (no close frame)
      // 4001: Custom close code for authentication failure
      
      // Don't attempt reconnection in production for normal closures or authentication failures
      if (event.code === 1000 || event.code === 1001 || event.code === 4001) {
        console.log("WebSocket closed normally, not attempting reconnection");
        return;
      }

      // For abnormal closures, attempt limited reconnection
      if (reconnectAttempts < maxReconnectAttempts) {
        console.log(`WebSocket abnormal closure (code: ${event.code}), attempting reconnection ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
        reconnect();
      } else {
        console.log("Max WebSocket reconnection attempts reached");
      }
    });

    // Add error handler
    socket.addEventListener("error", (event) => {
      // Only log errors in development environments
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit.dev')) {
        console.error("WebSocket error occurred:", event);
      } else {
        // In production, silently handle WebSocket failures as they're non-critical
        console.log("WebSocket unavailable - continuing without real-time features");
      }
    });

    // Cleanup on unmount
    return () => {
      console.log("Closing WebSocket connection");
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }
    };
  }, [user, toast]);

  // Send message function
  const sendMessage = (event: WebSocketEvent) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(event));
    } else {
      // In production, WebSocket might not be available - fail silently
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('replit.dev')) {
        console.error("WebSocket is not connected");
        toast({
          title: "Connection Error",
          description: "Not connected to server. Please reload the page.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <WebSocketContext.Provider
      value={{ isConnected, lastMessage, sendMessage }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use the WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
