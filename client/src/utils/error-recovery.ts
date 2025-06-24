import { lazy, createElement } from "react";

/**
 * Enhanced error recovery utilities for handling various runtime errors
 * Provides graceful degradation and automatic recovery mechanisms
 */

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private errorCount: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000;

  static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  /**
   * Handle module loading failures with retry logic
   */
  async handleModuleLoadError(modulePath: string, importFn: () => Promise<any>): Promise<any> {
    const errorKey = `module_${modulePath}`;
    const currentCount = this.errorCount.get(errorKey) || 0;

    if (currentCount >= this.maxRetries) {
      console.warn(`Module ${modulePath} failed to load after ${this.maxRetries} attempts`);
      return { default: () => this.createFallbackComponent(modulePath) };
    }

    try {
      const module = await importFn();
      // Reset error count on success
      this.errorCount.delete(errorKey);
      return module;
    } catch (error) {
      this.errorCount.set(errorKey, currentCount + 1);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.retryDelay * (currentCount + 1)));
      
      // Retry the import
      return this.handleModuleLoadError(modulePath, importFn);
    }
  }

  /**
   * Create a fallback component when module loading fails
   */
  private createFallbackComponent(modulePath: string) {
    return function FallbackComponent() {
      return createElement('div', {
        className: 'min-h-[50vh] flex items-center justify-center'
      }, createElement('div', {
        className: 'text-center max-w-md mx-auto p-6'
      }, [
        createElement('div', { 
          key: 'icon',
          className: 'text-red-600 mb-4' 
        }, [
          createElement('svg', {
            key: 'svg',
            className: 'w-12 h-12 mx-auto mb-4',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          }, createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 2,
            d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z'
          }))
        ]),
        createElement('h3', {
          key: 'title',
          className: 'text-lg font-semibold mb-2'
        }, 'Page Temporarily Unavailable'),
        createElement('p', {
          key: 'description',
          className: 'text-gray-600 mb-4'
        }, 'We\'re having trouble loading this page. This is usually temporary.'),
        createElement('div', {
          key: 'buttons',
          className: 'space-y-2'
        }, [
          createElement('button', {
            key: 'refresh',
            onClick: () => window.location.reload(),
            className: 'w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
          }, 'Refresh Page'),
          createElement('button', {
            key: 'back',
            onClick: () => window.history.back(),
            className: 'w-full bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors'
          }, 'Go Back')
        ])
      ]));
    };
  }

  /**
   * Handle API errors with retry logic
   */
  async handleApiError(url: string, fetchFn: () => Promise<Response>): Promise<Response> {
    const errorKey = `api_${url}`;
    const currentCount = this.errorCount.get(errorKey) || 0;

    if (currentCount >= this.maxRetries) {
      throw new Error(`API request to ${url} failed after ${this.maxRetries} attempts`);
    }

    try {
      const response = await fetchFn();
      
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      // Reset error count on success
      this.errorCount.delete(errorKey);
      return response;
    } catch (error) {
      this.errorCount.set(errorKey, currentCount + 1);
      
      // Wait before retry for server errors
      if (error instanceof Error && error.message.includes('Server error')) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (currentCount + 1)));
        return this.handleApiError(url, fetchFn);
      }
      
      throw error;
    }
  }

  /**
   * Clear error counts for fresh starts
   */
  clearErrorCounts(): void {
    this.errorCount.clear();
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCount);
  }
}

/**
 * Enhanced lazy loading with error recovery
 */
export function createResilientLazyComponent(importFn: () => Promise<any>, componentName: string) {
  const errorRecovery = ErrorRecoveryManager.getInstance();
  
  return lazy(() => errorRecovery.handleModuleLoadError(componentName, importFn));
}

/**
 * Global error handler setup
 */
export function setupGlobalErrorHandling(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Log for debugging but don't show to user for certain errors
    if (error?.message?.includes('Loading chunk') || 
        error?.message?.includes('Failed to fetch dynamically imported module')) {
      console.debug('Module loading error handled:', error.message);
      event.preventDefault();
      return;
    }
    
    // Handle other unhandled rejections
    console.error('Unhandled promise rejection:', error);
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Skip Google Maps and module loading errors
    if (event.message?.includes('gmp-') ||
        event.message?.includes('Loading chunk') ||
        event.message?.includes('Failed to fetch dynamically imported module')) {
      event.preventDefault();
      return;
    }
    
    console.error('Global error:', error);
  });
}

// Initialize global error handling
if (typeof window !== 'undefined') {
  setupGlobalErrorHandling();
}