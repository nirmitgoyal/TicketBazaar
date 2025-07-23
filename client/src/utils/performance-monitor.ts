/**
 * Advanced Performance Monitoring for Core Web Vitals
 * Optimized for SEO ranking factors and user experience
 */

import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsScore {
  lcp: PerformanceMetric | null;
  fid: PerformanceMetric | null;
  cls: PerformanceMetric | null;
  inp: PerformanceMetric | null;
  fcp: PerformanceMetric | null;
  ttfb: PerformanceMetric | null;
}

class PerformanceMonitor {
  private metrics: WebVitalsScore = {
    lcp: null,
    fid: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null
  };

  private observer: PerformanceObserver | null = null;
  private isMonitoring = false;

  /**
   * Start monitoring Core Web Vitals
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;

    this.isMonitoring = true;
    this.initializeObserver();
    this.measureTTFB();
    this.measureFCP();
    this.measureLCP();
    this.measureCLS();
    this.measureFID();
    this.measureINP();

    // Report metrics periodically
    setTimeout(() => this.reportMetrics(), 5000);
  }

  /**
   * Initialize Performance Observer
   */
  private initializeObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => this.processEntry(entry));
      });

      // Observe various performance metrics
      this.observer.observe({ entryTypes: ['navigation', 'paint', 'layout-shift', 'largest-contentful-paint'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Process performance entries
   */
  private processEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.setMetric('lcp', entry.startTime);
        break;
      case 'layout-shift':
        this.updateCLS(entry as PerformanceLayoutShift);
        break;
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.setMetric('fcp', entry.startTime);
        }
        break;
    }
  }

  /**
   * Measure Time to First Byte (TTFB)
   */
  private measureTTFB(): void {
    if (!('performance' in window) || !performance.timing) return;

    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      this.setMetric('ttfb', ttfb);
    }
  }

  /**
   * Measure First Contentful Paint (FCP)
   */
  private measureFCP(): void {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      this.setMetric('fcp', fcpEntry.startTime);
    }
  }

  /**
   * Measure Largest Contentful Paint (LCP)
   */
  private measureLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    let lcp = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      lcp = lastEntry.startTime;
      this.setMetric('lcp', lcp);
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP measurement not supported');
    }
  }

  /**
   * Measure Cumulative Layout Shift (CLS)
   */
  private measureCLS(): void {
    let cls = 0;
    
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if ((entry as PerformanceLayoutShift).hadRecentInput) return;
        cls += (entry as PerformanceLayoutShift).value;
      });
      this.setMetric('cls', cls);
    });

    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS measurement not supported');
    }
  }

  /**
   * Update CLS score
   */
  private updateCLS(entry: PerformanceLayoutShift): void {
    if (entry.hadRecentInput) return;
    
    const currentCLS = this.metrics.cls?.value || 0;
    this.setMetric('cls', currentCLS + entry.value);
  }

  /**
   * Measure First Input Delay (FID)
   */
  private measureFID(): void {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const fidEntry = entry as PerformanceEventTiming;
        const fid = fidEntry.processingStart - fidEntry.startTime;
        this.setMetric('fid', fid);
      });
    });

    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID measurement not supported');
    }
  }

  /**
   * Measure Interaction to Next Paint (INP)
   */
  private measureINP(): void {
    if (!('PerformanceObserver' in window)) return;

    let maxINP = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const eventEntry = entry as PerformanceEventTiming;
        const inp = eventEntry.processingEnd - eventEntry.startTime;
        if (inp > maxINP) {
          maxINP = inp;
          this.setMetric('inp', inp);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['event'] });
    } catch (error) {
      console.warn('INP measurement not supported');
    }
  }

  /**
   * Set metric value with rating
   */
  private setMetric(name: keyof WebVitalsScore, value: number): void {
    const rating = this.getRating(name, value);
    this.metrics[name] = {
      name,
      value,
      rating,
      timestamp: Date.now()
    };
  }

  /**
   * Get performance rating based on Core Web Vitals thresholds
   */
  private getRating(metric: keyof WebVitalsScore, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      inp: { good: 200, poor: 500 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebVitalsScore {
    return { ...this.metrics };
  }

  /**
   * Get overall performance score
   */
  getPerformanceScore(): { score: number; grade: string } {
    const metrics = Object.values(this.metrics).filter(m => m !== null);
    if (metrics.length === 0) return { score: 0, grade: 'F' };

    const scores = metrics.map(m => {
      switch (m!.rating) {
        case 'good': return 100;
        case 'needs-improvement': return 70;
        case 'poor': return 30;
        default: return 0;
      }
    });

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const grade = averageScore >= 90 ? 'A' : 
                  averageScore >= 80 ? 'B' : 
                  averageScore >= 70 ? 'C' : 
                  averageScore >= 60 ? 'D' : 'F';

    return { score: Math.round(averageScore), grade };
  }

  /**
   * Report metrics to analytics
   */
  private reportMetrics(): void {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();

    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      Object.entries(metrics).forEach(([name, metric]) => {
        if (metric) {
          gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: name.toUpperCase(),
            value: Math.round(metric.value),
            custom_map: { metric_rating: metric.rating }
          });
        }
      });

      // Report overall score
      gtag('event', 'performance_score', {
        event_category: 'Performance',
        event_label: 'Overall Score',
        value: score.score,
        custom_map: { grade: score.grade }
      });
    }

    // Log for debugging
    console.log('Core Web Vitals:', {
      ...metrics,
      overall: score
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.isMonitoring = false;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for React components to use performance monitoring
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<WebVitalsScore>(performanceMonitor.getMetrics());
  const [score, setScore] = React.useState(performanceMonitor.getPerformanceScore());

  React.useEffect(() => {
    performanceMonitor.startMonitoring();

    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setScore(performanceMonitor.getPerformanceScore());
    }, 1000);

    return () => {
      clearInterval(interval);
      performanceMonitor.stopMonitoring();
    };
  }, []);

  return { metrics, score };
}

/**
 * Initialize performance monitoring on page load
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window !== 'undefined') {
    // Start monitoring after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        performanceMonitor.startMonitoring();
      });
    } else {
      performanceMonitor.startMonitoring();
    }
  }
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  initializePerformanceMonitoring();
}