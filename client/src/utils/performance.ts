/**
 * Performance monitoring and optimization utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.setupObservers();
  }

  private setupObservers() {
    if (typeof window === 'undefined') return;

    // Observe Core Web Vitals
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: entry.name,
            value: (entry as any).value || (entry as any).duration || 0,
            timestamp: Date.now(),
            metadata: {
              entryType: entry.entryType,
              startTime: entry.startTime,
            }
          });
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Log significant performance issues
    if (metric.value > 1000 && metric.name.includes('render')) {
      console.warn(`Slow render detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    return name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics;
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.recordMetric({
      name,
      value: end - start,
      timestamp: Date.now(),
    });
    
    return result;
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    this.recordMetric({
      name,
      value: end - start,
      timestamp: Date.now(),
    });
    
    return result;
  }

  startTiming(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      this.recordMetric({
        name,
        value: end - start,
        timestamp: Date.now(),
      });
    };
  }

  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Bundle analyzer utility for monitoring chunk sizes
 */
export function logBundleInfo() {
  if (typeof window === 'undefined') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('Bundle Analysis');
  console.log(`Scripts loaded: ${scripts.length}`);
  console.log(`Stylesheets loaded: ${styles.length}`);
  
  scripts.forEach((script: Element) => {
    const src = script.getAttribute('src');
    if (src && !src.startsWith('http')) {
      console.log(`- ${src}`);
    }
  });
  
  console.groupEnd();
}

/**
 * Memory usage monitoring
 */
export function logMemoryUsage() {
  if (typeof window === 'undefined' || !(performance as any).memory) return;

  const memory = (performance as any).memory;
  const used = Math.round(memory.usedJSHeapSize / 1048576);
  const total = Math.round(memory.totalJSHeapSize / 1048576);
  const limit = Math.round(memory.jsHeapSizeLimit / 1048576);

  console.log(`Memory: ${used}MB / ${total}MB (limit: ${limit}MB)`);
  
  if (used / limit > 0.8) {
    console.warn('High memory usage detected!');
  }
}

/**
 * Image loading optimization
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    }))
  );
}

/**
 * Lazy loading intersection observer
 */
export function createLazyLoader(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}