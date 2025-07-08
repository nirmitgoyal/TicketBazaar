/**
 * Production WebSocket configuration
 * 
 * WebSocket connections are disabled in production to prevent console errors
 * and ensure better user experience. Real-time features are optional.
 * 
 * If you need to enable WebSocket in production:
 * 1. Ensure your server properly supports WebSocket connections
 * 2. Configure proper SSL/WSS setup for HTTPS domains
 * 3. Remove the production check in use-websocket.tsx
 * 4. Test thoroughly to ensure no console errors
 */

export const WEBSOCKET_CONFIG = {
  ENABLED_IN_PRODUCTION: false,
  REASON: "Disabled to prevent console errors and improve user experience",
  ALTERNATIVE: "Real-time features are optional and app works without them"
};

// Log WebSocket status on import in development
if (import.meta.env.DEV) {
  console.log("WebSocket Config:", WEBSOCKET_CONFIG);
}
