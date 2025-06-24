/**
 * Performance optimization utilities for reducing console noise
 * and improving overall application performance
 */

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceObserver?: PerformanceObserver;
  private memoryMonitor?: NodeJS.Timeout;

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize performance monitoring with reduced verbosity
   */
  init(): void {
    this.setupPerformanceObserver();
    this.setupMemoryMonitoring();
    this.optimizeGoogleMapsLoading();
  }

  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        // Only log significant performance issues
        entries.forEach(entry => {
          if (entry.duration > 1000) { // Only log if > 1 second
            console.debug(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'resource', 'measure'] 
      });
    } catch (error) {
      // Silently fail if PerformanceObserver is not supported
    }
  }

  private setupMemoryMonitoring(): void {
    // Only monitor memory in development and less frequently
    if (import.meta.env.DEV && 'memory' in performance) {
      this.memoryMonitor = setInterval(() => {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1048576);
        const limit = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        // Only warn if memory usage is critical
        if (used / limit > 0.9) {
          console.warn(`High memory usage: ${used}MB / ${limit}MB`);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private optimizeGoogleMapsLoading(): void {
    // Prevent Google Maps from logging redundant warnings
    const originalCustomElements = window.customElements?.define;
    if (originalCustomElements) {
      window.customElements.define = function(name: string, constructor: any, options?: any) {
        try {
          return originalCustomElements.call(this, name, constructor, options);
        } catch (error) {
          // Silently ignore "already defined" errors for Google Maps elements
          if (error instanceof Error && 
              error.message.includes('already defined') && 
              name.startsWith('gmp-')) {
            return;
          }
          throw error;
        }
      };
    }
  }

  /**
   * Clean up performance monitoring
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
  }

  /**
   * Optimize bundle loading by preloading critical chunks
   */
  preloadCriticalChunks(): void {
    const criticalRoutes = [
      '/src/pages/home.tsx',
      '/src/pages/login.tsx',
      '/src/pages/list-ticket.tsx'
    ];

    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = route;
      document.head.appendChild(link);
    });
  }

  /**
   * Debounce function for reducing API calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle function for limiting event handlers
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize performance optimizer
const optimizer = PerformanceOptimizer.getInstance();
optimizer.init();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  optimizer.cleanup();
});

export default optimizer;