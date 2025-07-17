/**
 * Basic WebSocket connection management for development
 * and process polyfill for browser environment
 */

// Add process polyfill for browser environment
if (typeof window !== 'undefined' && typeof process === 'undefined') {
  (window as any).process = {
    env: {
      NODE_ENV: import.meta.env.MODE || 'development',
      // Add other environment variables as needed
    }
  };
}

// Clean up WebSocket connections on page unload
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.addEventListener('beforeunload', () => {
    if ((window as any).__viteWebSocket) {
      (window as any).__viteWebSocket.close();
    }
  });
}

export {};