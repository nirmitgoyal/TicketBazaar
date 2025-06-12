/**
 * Basic WebSocket connection management for development
 */

// Clean up WebSocket connections on page unload
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.addEventListener('beforeunload', () => {
    if ((window as any).__viteWebSocket) {
      (window as any).__viteWebSocket.close();
    }
  });
}

export {};