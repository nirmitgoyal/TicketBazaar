/**
 * Error suppression utilities for production environments
 * Prevents WebSocket and other non-critical errors from appearing in console
 */

let isInitialized = false;

export function initializeErrorSuppression(): void {
  if (isInitialized || typeof window === 'undefined') return;
  
  const isProduction = window.location.hostname !== 'localhost' && 
                      !window.location.hostname.includes('replit.dev');
  
  if (!isProduction) return;
  
  // Suppress WebSocket and other non-critical errors
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    
    if (
      message.includes('websocket') ||
      message.includes('wss://') ||
      message.includes('ws://') ||
      message.includes('failed to fetch dynamically imported module') ||
      message.includes('script error') ||
      message.includes('loading chunk') ||
      message.includes('gmp-')
    ) {
      return; // Silently ignore these errors in production
    }
    
    originalError.apply(console, args);
  };
  
  // Handle window error events
  window.addEventListener('error', (event) => {
    const message = event.message?.toLowerCase() || '';
    
    if (
      message.includes('websocket') ||
      message.includes('wss://') ||
      message.includes('ws://') ||
      message.includes('script error') ||
      message.includes('loading chunk')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason).toLowerCase();
    
    if (
      reason.includes('websocket') ||
      reason.includes('wss://') ||
      reason.includes('ws://') ||
      reason.includes('failed to fetch')
    ) {
      event.preventDefault();
      return false;
    }
  });
  
  isInitialized = true;
  console.log('Error suppression initialized for production environment');
}