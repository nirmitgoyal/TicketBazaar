/**
 * WebSocket fallback utility for production environments
 * Provides graceful degradation when WebSocket connections fail
 */

export interface WebSocketFallback {
  isSupported: boolean;
  canConnect: (url: string) => Promise<boolean>;
  shouldSuppressErrors: boolean;
}

/**
 * Check if WebSocket connections are supported and working in the current environment
 */
export function createWebSocketFallback(): WebSocketFallback {
  const isSupported = typeof WebSocket !== 'undefined';
  const isProduction = window.location.hostname !== 'localhost' && 
                      !window.location.hostname.includes('replit.dev');
  
  return {
    isSupported,
    shouldSuppressErrors: isProduction,
    
    async canConnect(url: string): Promise<boolean> {
      if (!isSupported) return false;
      
      return new Promise((resolve) => {
        try {
          const testSocket = new WebSocket(url);
          let resolved = false;
          
          const cleanup = () => {
            if (!resolved) {
              resolved = true;
              testSocket.close();
            }
          };
          
          testSocket.onopen = () => {
            if (!resolved) {
              resolved = true;
              testSocket.close();
              resolve(true);
            }
          };
          
          testSocket.onerror = () => {
            cleanup();
            resolve(false);
          };
          
          testSocket.onclose = () => {
            if (!resolved) {
              resolved = true;
              resolve(false);
            }
          };
          
          // Timeout after 5 seconds
          setTimeout(() => {
            cleanup();
            resolve(false);
          }, 5000);
          
        } catch (error) {
          resolve(false);
        }
      });
    }
  };
}

/**
 * Suppress WebSocket-related console errors in production
 */
export function suppressWebSocketErrors(): void {
  if (typeof window === 'undefined') return;
  
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    
    // Suppress WebSocket-related errors in production
    if (
      window.location.hostname !== 'localhost' &&
      !window.location.hostname.includes('replit.dev') &&
      (
        message.includes('websocket') ||
        message.includes('wss://') ||
        message.includes('ws://') ||
        message.includes('failed to fetch')
      )
    ) {
      return; // Silently ignore
    }
    
    originalConsoleError.apply(console, args);
  };
}