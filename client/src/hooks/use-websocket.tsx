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

  useEffect(() => {
    // Only connect when user is authenticated
    if (!user) {
      return;
    }

    const connectWebSocket = () => {
      try {
        // Get a reliable host (handle both development and production)
        let host = window.location.host;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

        // Get the actual production/deployment domain or fallback to the hostname
        if (host.includes("undefined") || !host) {
          // In case the host is broken, fallback to a domain we know works
          // First try to get the hostname without the port
          host = window.location.hostname || "localhost:5000";
        }

        // Construct WebSocket URL with the /ws path
        const wsUrl = `${protocol}//${host}/ws`;

        console.log("Connecting to WebSocket:", wsUrl);

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
    const maxReconnectAttempts = 5;

    // Function to handle reconnection with backoff
    const reconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;

        console.log(
          `WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
        );

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
        console.error("Max WebSocket reconnection attempts reached");
        toast({
          title: "Connection Error",
          description:
            "Unable to establish real-time connection after multiple attempts.",
          variant: "destructive",
        });
      }
    };

    // Connection opened
    socket.addEventListener("open", () => {
      console.log("WebSocket connection established");
      setIsConnected(true);

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

      // Only try to reconnect on abnormal closures, not when explicitly closed
      if (event.code !== 1000 && event.code !== 1001) {
        // Don't spam reconnect attempts for authentication failures (custom code we use)
        if (event.code !== 4001) {
          reconnect();
        }
      }
    });

    // Add error handler to trigger reconnection
    socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
      // Error already triggers close event which handles reconnection
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
      console.error("WebSocket is not connected");

      toast({
        title: "Connection Error",
        description: "Not connected to server. Please reload the page.",
        variant: "destructive",
      });
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
