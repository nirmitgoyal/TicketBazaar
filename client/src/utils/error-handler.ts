/**
 * Global error handler for unhandled promise rejections and JavaScript errors
 */

import { clientLogger } from '@/utils/logger';

/**
 * Initialize global error handlers
 */
export function initializeGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Log the error
    clientLogger.error('GLOBAL_ERROR', 'Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise,
      stack: event.reason?.stack || 'No stack trace available'
    });

    // In development, show more details
    if (import.meta.env.DEV) {
      console.error('Unhandled promise rejection:', event.reason);
    }

    // Handle specific error types
    if (event.reason?.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, clearing storage');
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn('Failed to clear storage:', e);
      }
    }

    // Prevent the default browser error handling
    event.preventDefault();
  });

  // Handle uncaught JavaScript errors
  window.addEventListener('error', (event) => {
    // Log the error
    clientLogger.error('GLOBAL_ERROR', 'Uncaught JavaScript error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });

    // In development, show more details
    if (import.meta.env.DEV) {
      console.error('Uncaught error:', event.error || event.message);
    }

    // Handle specific error types
    if (event.message.includes('childElementCount')) {
      console.warn('DOM manipulation error detected, likely safe to ignore');
      return true; // Prevent default error handling
    }

    if (event.message.includes('Loading chunk')) {
      console.warn('Chunk loading error detected, may need page refresh');
      // Don't prevent default handling for chunk errors
    }

    // Don't prevent default error handling by default
    return false;
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    if (target && target.tagName) {
      // Log resource loading errors
      clientLogger.warn('RESOURCE_ERROR', `Failed to load ${target.tagName.toLowerCase()}`, {
        tagName: target.tagName,
        src: (target as any).src || (target as any).href,
        currentSrc: (target as any).currentSrc
      });

      // Handle specific resource types
      if (target.tagName === 'SCRIPT') {
        console.warn('Script loading failed:', (target as any).src);
      } else if (target.tagName === 'LINK') {
        console.warn('Stylesheet loading failed:', (target as any).href);
      } else if (target.tagName === 'IMG') {
        console.warn('Image loading failed:', (target as any).src);
      }
    }
  }, true); // Use capture phase to catch all resource errors

  // Handle network errors
  window.addEventListener('online', () => {
    clientLogger.info('NETWORK', 'Network connection restored');
  });

  window.addEventListener('offline', () => {
    clientLogger.warn('NETWORK', 'Network connection lost');
  });
}

/**
 * Safe async operation wrapper
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Async operation failed'
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    clientLogger.error('SAFE_ASYNC', errorMessage, error);
    
    if (import.meta.env.DEV) {
      console.error(`${errorMessage}:`, error);
    }
    
    return null;
  }
}

/**
 * Safe synchronous operation wrapper
 */
export function safeSync<T>(
  operation: () => T,
  errorMessage: string = 'Sync operation failed'
): T | null {
  try {
    return operation();
  } catch (error) {
    clientLogger.error('SAFE_SYNC', errorMessage, error);
    
    if (import.meta.env.DEV) {
      console.error(`${errorMessage}:`, error);
    }
    
    return null;
  }
}

/**
 * Retry mechanism for failed operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        clientLogger.error('RETRY_OPERATION', `Operation failed after ${maxRetries} attempts`, error);
        return null;
      }
      
      clientLogger.warn('RETRY_OPERATION', `Attempt ${attempt} failed, retrying...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
}
