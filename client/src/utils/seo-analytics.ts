/**
 * SEO Analytics Tracking Utility
 * Tracks SEO performance, user behavior, and Core Web Vitals
 */

import React from 'react';

export interface SEOAnalyticsConfig {
  trackingId?: string;
  enableCoreWebVitals?: boolean;
  enableUserTiming?: boolean;
  enableAITracking?: boolean;
  enableConversionTracking?: boolean;
  enableScrollTracking?: boolean;
  enableClickTracking?: boolean;
}

export interface SEOEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: Record<string, string>;
}

export interface ConversionEvent {
  type: 'ticket_listed' | 'contact_made' | 'verification_completed' | 'faq_viewed' | 'guide_completed';
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface UserEngagementMetrics {
  timeOnPage: number;
  scrollDepth: number;
  clickCount: number;
  pageViews: number;
  bounceRate: number;
}

class SEOAnalytics {
  private config: SEOAnalyticsConfig;
  private startTime: number;
  private maxScrollDepth: number = 0;
  private clickCount: number = 0;
  private engagementTimer: number | null = null;

  constructor(config: SEOAnalyticsConfig = {}) {
    this.config = {
      enableCoreWebVitals: true,
      enableUserTiming: true,
      enableAITracking: true,
      enableConversionTracking: true,
      enableScrollTracking: true,
      enableClickTracking: true,
      ...config
    };
    this.startTime = Date.now();
    this.initialize();
  }

  /**
   * Initialize analytics tracking
   */
  private initialize(): void {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    if (this.config.enableCoreWebVitals) {
      this.initializeCoreWebVitals();
    }

    // Track user engagement
    if (this.config.enableScrollTracking) {
      this.initializeScrollTracking();
    }

    if (this.config.enableClickTracking) {
      this.initializeClickTracking();
    }

    // Track page timing
    if (this.config.enableUserTiming) {
      this.initializeUserTiming();
    }

    // Track AI-specific events
    if (this.config.enableAITracking) {
      this.initializeAITracking();
    }

    // Set up engagement timer
    this.startEngagementTracking();
  }

  /**
   * Track SEO event
   */
  trackEvent(event: SEOEvent): void {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      const eventData: any = {
        event_category: event.category,
        event_label: event.label,
        value: event.value
      };

      // Add custom dimensions
      if (event.customDimensions) {
        Object.entries(event.customDimensions).forEach(([key, value]) => {
          eventData[`custom_${key}`] = value;
        });
      }

      gtag('event', event.action, eventData);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('SEO Event:', event);
    }
  }

  /**
   * Track conversion event
   */
  trackConversion(conversion: ConversionEvent): void {
    this.trackEvent({
      category: 'Conversion',
      action: conversion.type,
      label: 'SEO_Conversion',
      value: conversion.value,
      customDimensions: {
        conversion_type: conversion.type,
        currency: conversion.currency || 'INR',
        ...conversion.metadata
      }
    });

    // Track for SEO performance monitoring
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID', // Replace with actual conversion ID
        value: conversion.value || 1,
        currency: conversion.currency || 'INR',
        transaction_id: Date.now().toString()
      });
    }
  }

  /**
   * Track page view with SEO data
   */
  trackPageView(
    path: string, 
    title: string,
    seoData?: {
      keywords?: string;
      contentType?: string;
      wordCount?: number;
      readingTime?: number;
    }
  ): void {
    if (typeof gtag !== 'undefined') {
      gtag('config', this.config.trackingId || 'GA_TRACKING_ID', {
        page_path: path,
        page_title: title,
        custom_map: {
          content_type: seoData?.contentType,
          word_count: seoData?.wordCount,
          reading_time: seoData?.readingTime,
          target_keywords: seoData?.keywords
        }
      });
    }

    this.trackEvent({
      category: 'Page View',
      action: 'view',
      label: path,
      customDimensions: {
        page_type: seoData?.contentType || 'unknown',
        word_count: seoData?.wordCount?.toString() || '0',
        reading_time: seoData?.readingTime?.toString() || '0'
      }
    });
  }

  /**
   * Track search queries
   */
  trackSearch(query: string, resultCount: number, source: 'internal' | 'voice' | 'ai'): void {
    this.trackEvent({
      category: 'Search',
      action: 'query',
      label: query,
      value: resultCount,
      customDimensions: {
        search_source: source,
        result_count: resultCount.toString(),
        query_length: query.length.toString()
      }
    });
  }

  /**
   * Track AI-related events
   */
  trackAIEvent(eventType: 'ai_referral' | 'voice_search' | 'featured_snippet' | 'knowledge_panel', data?: Record<string, string>): void {
    this.trackEvent({
      category: 'AI_SEO',
      action: eventType,
      label: 'AI_Optimization',
      customDimensions: {
        ai_event_type: eventType,
        ...data
      }
    });
  }

  /**
   * Track Core Web Vitals
   */
  private initializeCoreWebVitals(): void {
    // Track LCP (Largest Contentful Paint)
    this.observePerformanceMetric('largest-contentful-paint', (entry) => {
      this.trackEvent({
        category: 'Core Web Vitals',
        action: 'LCP',
        label: 'Largest Contentful Paint',
        value: Math.round(entry.startTime),
        customDimensions: {
          metric_rating: this.getCWVRating('lcp', entry.startTime),
          page_url: window.location.pathname
        }
      });
    });

    // Track FID (First Input Delay)
    this.observePerformanceMetric('first-input', (entry) => {
      const fid = (entry as any).processingStart - entry.startTime;
      this.trackEvent({
        category: 'Core Web Vitals',
        action: 'FID',
        label: 'First Input Delay',
        value: Math.round(fid),
        customDimensions: {
          metric_rating: this.getCWVRating('fid', fid),
          page_url: window.location.pathname
        }
      });
    });

    // Track CLS (Cumulative Layout Shift)
    let cumulativeLayoutShift = 0;
    this.observePerformanceMetric('layout-shift', (entry) => {
      if (!(entry as any).hadRecentInput) {
        cumulativeLayoutShift += (entry as any).value;
        this.trackEvent({
          category: 'Core Web Vitals',
          action: 'CLS',
          label: 'Cumulative Layout Shift',
          value: Math.round(cumulativeLayoutShift * 1000),
          customDimensions: {
            metric_rating: this.getCWVRating('cls', cumulativeLayoutShift),
            page_url: window.location.pathname
          }
        });
      }
    });
  }

  /**
   * Initialize scroll tracking
   */
  private initializeScrollTracking(): void {
    let ticking = false;

    const updateScrollDepth = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100);

      if (scrollDepth > this.maxScrollDepth) {
        this.maxScrollDepth = scrollDepth;

        // Track milestone scroll depths
        const milestones = [25, 50, 75, 90, 100];
        const milestone = milestones.find(m => this.maxScrollDepth >= m && scrollDepth >= m);
        
        if (milestone) {
          this.trackEvent({
            category: 'User Engagement',
            action: 'scroll_depth',
            label: `${milestone}%`,
            value: milestone,
            customDimensions: {
              page_url: window.location.pathname,
              scroll_depth: milestone.toString()
            }
          });
        }
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDepth);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /**
   * Initialize click tracking
   */
  private initializeClickTracking(): void {
    document.addEventListener('click', (event) => {
      this.clickCount++;
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'A') {
        const href = (target as HTMLAnchorElement).href;
        const isExternal = href && !href.includes(window.location.hostname);
        
        this.trackEvent({
          category: 'Link Click',
          action: isExternal ? 'external_link' : 'internal_link',
          label: href,
          customDimensions: {
            link_type: isExternal ? 'external' : 'internal',
            link_text: target.textContent || 'No text',
            page_url: window.location.pathname
          }
        });
      }

      if (target.tagName === 'BUTTON' || target.type === 'submit') {
        this.trackEvent({
          category: 'Button Click',
          action: 'click',
          label: target.textContent || target.id || 'Unknown button',
          customDimensions: {
            button_type: target.type || 'button',
            button_text: target.textContent || 'No text',
            page_url: window.location.pathname
          }
        });
      }
    });
  }

  /**
   * Initialize user timing tracking
   */
  private initializeUserTiming(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.trackEvent({
            category: 'Performance',
            action: 'page_timing',
            label: 'Navigation Timing',
            value: Math.round(navigation.loadEventEnd - navigation.fetchStart),
            customDimensions: {
              dns_time: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart).toString(),
              connect_time: Math.round(navigation.connectEnd - navigation.connectStart).toString(),
              response_time: Math.round(navigation.responseEnd - navigation.requestStart).toString(),
              dom_interactive: Math.round(navigation.domInteractive - navigation.fetchStart).toString(),
              page_url: window.location.pathname
            }
          });
        }
      }, 1000);
    });
  }

  /**
   * Initialize AI-specific tracking
   */
  private initializeAITracking(): void {
    // Track referrals from AI systems
    const referrer = document.referrer;
    const aiSources = ['chat.openai.com', 'perplexity.ai', 'claude.ai', 'bard.google.com'];
    
    if (aiSources.some(source => referrer.includes(source))) {
      this.trackAIEvent('ai_referral', {
        referrer_domain: new URL(referrer).hostname,
        landing_page: window.location.pathname
      });
    }

    // Track voice search indicators
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('speech') || userAgent.includes('voice')) {
      this.trackAIEvent('voice_search', {
        user_agent: userAgent,
        page_url: window.location.pathname
      });
    }
  }

  /**
   * Start engagement tracking
   */
  private startEngagementTracking(): void {
    this.engagementTimer = window.setInterval(() => {
      const timeOnPage = Date.now() - this.startTime;
      
      // Track engagement milestones
      const milestones = [30, 60, 120, 300]; // seconds
      const milestone = milestones.find(m => timeOnPage >= m * 1000 && timeOnPage < (m + 5) * 1000);
      
      if (milestone) {
        this.trackEvent({
          category: 'User Engagement',
          action: 'time_on_page',
          label: `${milestone}s`,
          value: milestone,
          customDimensions: {
            engagement_level: this.getEngagementLevel(timeOnPage, this.maxScrollDepth, this.clickCount),
            page_url: window.location.pathname
          }
        });
      }
    }, 5000);
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics(): UserEngagementMetrics {
    return {
      timeOnPage: Date.now() - this.startTime,
      scrollDepth: this.maxScrollDepth,
      clickCount: this.clickCount,
      pageViews: 1, // Simplified
      bounceRate: this.calculateBounceRate()
    };
  }

  /**
   * Observe performance metrics
   */
  private observePerformanceMetric(entryType: string, callback: (entry: PerformanceEntry) => void): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(callback);
      });
      observer.observe({ entryTypes: [entryType] });
    } catch (error) {
      console.warn(`Failed to observe ${entryType}:`, error);
    }
  }

  /**
   * Get Core Web Vitals rating
   */
  private getCWVRating(metric: 'lcp' | 'fid' | 'cls', value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get engagement level
   */
  private getEngagementLevel(timeOnPage: number, scrollDepth: number, clickCount: number): string {
    const timeScore = timeOnPage > 120000 ? 3 : timeOnPage > 60000 ? 2 : 1;
    const scrollScore = scrollDepth > 75 ? 3 : scrollDepth > 25 ? 2 : 1;
    const clickScore = clickCount > 3 ? 3 : clickCount > 1 ? 2 : 1;
    
    const totalScore = timeScore + scrollScore + clickScore;
    
    if (totalScore >= 8) return 'high';
    if (totalScore >= 6) return 'medium';
    return 'low';
  }

  /**
   * Calculate bounce rate (simplified)
   */
  private calculateBounceRate(): number {
    const timeOnPage = Date.now() - this.startTime;
    const isBounce = timeOnPage < 30000 && this.maxScrollDepth < 25 && this.clickCount === 0;
    return isBounce ? 100 : 0;
  }

  /**
   * Clean up tracking
   */
  destroy(): void {
    if (this.engagementTimer) {
      clearInterval(this.engagementTimer);
      this.engagementTimer = null;
    }
  }
}

// Export singleton instance
export const seoAnalytics = new SEOAnalytics();

/**
 * React hook for SEO analytics
 */
export function useSEOAnalytics() {
  const [metrics, setMetrics] = React.useState<UserEngagementMetrics | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(seoAnalytics.getUserEngagementMetrics());
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(interval);
      seoAnalytics.destroy();
    };
  }, []);

  const trackEvent = React.useCallback((event: SEOEvent) => {
    seoAnalytics.trackEvent(event);
  }, []);

  const trackConversion = React.useCallback((conversion: ConversionEvent) => {
    seoAnalytics.trackConversion(conversion);
  }, []);

  const trackPageView = React.useCallback((path: string, title: string, seoData?: any) => {
    seoAnalytics.trackPageView(path, title, seoData);
  }, []);

  return {
    metrics,
    trackEvent,
    trackConversion,
    trackPageView
  };
}

// Auto-initialize analytics
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Analytics is already initialized in constructor
    });
  }
}