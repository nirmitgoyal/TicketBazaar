import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

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

  // Send message function that handles production gracefully
  const sendMessage = (event: WebSocketEvent) => {
    // In production, WebSocket is disabled, so silently ignore messages
    if (import.meta.env.PROD) {
      return;
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(event));
    } else {
      // Only show errors in development
      if (import.meta.env.DEV) {
        console.error("WebSocket is not connected");
        toast({
          title: "Connection Error",
          description: "Not connected to server. Please reload the page.",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    // Skip WebSocket entirely in production to avoid console errors
    if (import.meta.env.PROD) {
      console.log("WebSocket disabled in production - real-time features unavailable");
      return;
    }

    // Only connect when user is authenticated
    if (!user) {
      return;
    }

    // Check if WebSocket is supported in this environment
    if (typeof WebSocket === 'undefined') {
      console.log("WebSocket not supported in this environment");
      return;
    }

    // Skip WebSocket connection in test/CI environments
    if (process.env.NODE_ENV === 'test' || process.env.CI) {
      return;
    }

    const connectWebSocket = () => {
      try {
        // Get a reliable host (handle both development and production)
        const host = window.location.host;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

        // Construct WebSocket URL with the /ws path
        const wsUrl = `${protocol}//${host}/ws`;

        // Only log in development
        if (import.meta.env.DEV) {
          console.log(`Attempting WebSocket connection to: ${wsUrl}`);
        }

        // Create a new connection with enhanced error handling
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        return socket;
      } catch (error) {
        // Silently fail in production
        if (import.meta.env.DEV) {
          console.error("Failed to create WebSocket connection:", error);
        }
        return null;
      }
    };

    const initializeWebSocket = () => {
      // Create the initial connection
      const socket = connectWebSocket();
      if (!socket) return; // Exit if connection failed

      // Implement reconnection logic with exponential backoff
      let reconnectAttempts = 0;
      const maxReconnectAttempts = import.meta.env.PROD ? 0 : 1; // No reconnection in production

      // Function to handle reconnection with backoff
      const reconnect = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = 5000; // Fixed 5 second delay
          reconnectAttempts++;

          if (import.meta.env.DEV) {
            console.log(`WebSocket reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`);
          }

          setTimeout(() => {
            if (user) {
              const newSocket = connectWebSocket();
              if (newSocket) {
                // Setup will happen in the normal flow
                setupSocketListeners(newSocket, reconnect);
              }
            }
          }, delay);
        } else {
          if (import.meta.env.DEV) {
            console.log("Max WebSocket reconnection attempts reached - continuing without real-time updates");
          }
          // Don't show error toast in production as WebSocket is non-critical
          if (import.meta.env.DEV) {
            toast({
              title: "Connection Notice",
              description: "Real-time updates unavailable. App will continue to work normally.",
              variant: "default",
            });
          }
        }
      };

      const setupSocketListeners = (socket: WebSocket, reconnectFn: () => void) => {
        // Connection opened
        socket.addEventListener("open", () => {
          if (import.meta.env.DEV) {
            console.log("WebSocket connection established successfully");
          }
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
            if (import.meta.env.DEV) {
              console.log("WebSocket message received:", data);
            }
            setLastMessage(data);

            // Handle notifications
            if (data.type === WebSocketEventType.NOTIFICATION) {
              toast({
                title: "Notification",
                description: data.payload.message,
              });
            }
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error("Error parsing WebSocket message:", error);
            }
          }
        });

        // Connection closed
        socket.addEventListener("close", (event) => {
          if (import.meta.env.DEV) {
            console.log("WebSocket connection closed", event.code, event.reason);
          }
          setIsConnected(false);

          // Handle different close codes appropriately
          // 1000: Normal closure
          // 1001: Going away (page refresh/navigate)
          // 1006: Abnormal closure (no close frame)
          // 4001: Custom close code for authentication failure
          
          // Don't attempt reconnection in production or for normal closures
          if (import.meta.env.PROD || event.code === 1000 || event.code === 1001 || event.code === 4001) {
            if (import.meta.env.DEV) {
              console.log("WebSocket closed normally, not attempting reconnection");
            }
            return;
          }

          // For abnormal closures in development, attempt limited reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            if (import.meta.env.DEV) {
              console.log(`WebSocket abnormal closure (code: ${event.code}), attempting reconnection ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
            }
            reconnectFn();
          } else {
            if (import.meta.env.DEV) {
              console.log("Max WebSocket reconnection attempts reached");
            }
          }
        });

        // Add error handler
        socket.addEventListener("error", (event) => {
          // Only log errors in development environments
          if (import.meta.env.DEV) {
            console.error("WebSocket error occurred:", event);
          } else {
            // In production, silently handle WebSocket failures as they're non-critical
            console.log("WebSocket unavailable - continuing without real-time features");
          }
        });
      };

      // Setup listeners for the initial socket
      setupSocketListeners(socket, reconnect);

      // Cleanup on unmount
      return () => {
        if (import.meta.env.DEV) {
          console.log("Closing WebSocket connection");
        }
        if (
          socketRef.current &&
          socketRef.current.readyState === WebSocket.OPEN
        ) {
          socketRef.current.close();
        }
      };
    };

    // For development only, proceed with WebSocket setup
    return initializeWebSocket();
  }, [user, toast]);

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
