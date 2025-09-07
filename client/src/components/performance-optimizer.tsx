/**
 * Performance Optimization Component for GEO
 * Implements Core Web Vitals improvements and technical optimizations
 */

import React, { useEffect } from "react";

interface PerformanceOptimizerProps {
  enablePreloading?: boolean;
  enableLazyLoading?: boolean;
  enableCriticalCSS?: boolean;
  enableServiceWorker?: boolean;
}

export function PerformanceOptimizer({
  enablePreloading = true,
  enableLazyLoading = true,
  enableCriticalCSS = true,
  enableServiceWorker = true
}: PerformanceOptimizerProps) {
  
  useEffect(() => {
    // Preload critical resources
    if (enablePreloading) {
      preloadCriticalResources();
    }

    // Enable lazy loading for images
    if (enableLazyLoading) {
      enableImageLazyLoading();
    }

    // Register service worker for caching
    if (enableServiceWorker) {
      registerServiceWorker();
    }

    // Optimize font loading
    optimizeFontLoading();

    // Enable resource hints
    addResourceHints();

    // Monitor Core Web Vitals
    monitorCoreWebVitals();

  }, [enablePreloading, enableLazyLoading, enableServiceWorker]);

  return null; // This component doesn't render anything
}

/**
 * Preload critical resources for faster LCP
 */
function preloadCriticalResources() {
  const criticalResources = [
    { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
    { href: '/images/hero-bg.webp', as: 'image' },
    { href: '/api/events/featured', as: 'fetch', crossOrigin: 'anonymous' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
    document.head.appendChild(link);
  });
}

/**
 * Enable lazy loading for images to improve LCP
 */
function enableImageLazyLoading() {
  // Add intersection observer for images without native lazy loading
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    setTimeout(() => {
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => imageObserver.observe(img));
    }, 100);
  }
}

/**
 * Register service worker for caching and offline support
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.error('SW registration failed: ', registrationError);
        });
    });
  }
}

/**
 * Optimize font loading to prevent layout shift
 */
function optimizeFontLoading() {
  // Preload critical fonts
  const fontUrls = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  ];

  fontUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'style';
    link.onload = function(this: HTMLLinkElement) {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  });
}

/**
 * Add resource hints for performance
 */
function addResourceHints() {
  const resourceHints = [
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
    { rel: 'dns-prefetch', href: 'https://connect.facebook.net' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://api.ticketbazaar.co.in' }
  ];

  resourceHints.forEach(hint => {
    if (!document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`)) {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.rel === 'preconnect') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
}

/**
 * Monitor Core Web Vitals for continuous optimization
 */
function monitorCoreWebVitals() {
  // Only in production with analytics
  if (process.env.NODE_ENV === 'production' && window.gtag) {
    
    // Monitor LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        console.log('LCP candidate:', entry.startTime);
        window.gtag('event', 'web_vitals', {
          name: 'LCP',
          value: Math.round(entry.startTime),
          event_category: 'Core Web Vitals'
        });
      }
    }).observe({entryTypes: ['largest-contentful-paint']});

    // Monitor FID (First Input Delay) - Now INP (Interaction to Next Paint)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as any; // Type assertion for FID entry
        console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
        window.gtag('event', 'web_vitals', {
          name: 'FID',
          value: Math.round(fidEntry.processingStart - fidEntry.startTime),
          event_category: 'Core Web Vitals'
        });
      }
    }).observe({entryTypes: ['first-input']});

    // Monitor CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const clsEntry = entry as any; // Type assertion for CLS entry
        if (!clsEntry.hadRecentInput) {
          clsValue += clsEntry.value;
          console.log('CLS:', clsValue);
          window.gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Core Web Vitals'
          });
        }
      }
    }).observe({entryTypes: ['layout-shift']});
  }
}

/**
 * Image optimization component with WebP support and lazy loading
 */
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  loading = 'lazy'
}: OptimizedImageProps) {
  
  // Generate WebP and fallback URLs
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const fallbackSrc = src;

  return (
    <picture className={className}>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        style={{
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
          aspectRatio: width && height ? `${width}/${height}` : 'auto'
        }}
        onError={(e) => {
          // Fallback to original if WebP fails
          const target = e.target as HTMLImageElement;
          if (target.src === webpSrc) {
            target.src = fallbackSrc;
          }
        }}
      />
    </picture>
  );
}

/**
 * Critical CSS inlining component
 */
export function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* Critical above-the-fold styles */
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          line-height: 1.6;
        }
        .hero-section {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .nav-header {
          height: 64px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          text-decoration: none;
          display: inline-block;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        /* Prevent layout shift */
        .image-placeholder {
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `
    }} />
  );
}

/**
 * Compression and minification utilities
 */
export class CompressionUtils {
  
  static compressJSON(data: any): string {
    return JSON.stringify(data, null, 0);
  }

  static async compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  static enableGzipHeaders() {
    // This would typically be configured on the server
    // Here we can add client-side hints
    if ('serviceWorker' in navigator) {
      return {
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=31536000'
      };
    }
    return {};
  }
}

/**
 * AI referral tracking for GEO optimization
 */
export function trackAIReferrals() {
  useEffect(() => {
    const referrer = document.referrer;
    const userAgent = navigator.userAgent;
    
    // Detect AI/LLM referrals
    const aiSources = [
      'chat.openai.com',
      'bing.com/chat',
      'bard.google.com',
      'claude.ai',
      'perplexity.ai',
      'you.com',
      'copilot.microsoft.com'
    ];
    
    const isAIReferral = aiSources.some(source => referrer.includes(source));
    const isBotUA = /bot|crawler|spider|ChatGPT|GPT|Claude|Bard/i.test(userAgent);
    
    if (isAIReferral || isBotUA) {
      // Track AI referral
      if (window.gtag) {
        window.gtag('event', 'ai_referral', {
          source: referrer || 'unknown',
          user_agent: userAgent,
          event_category: 'GEO'
        });
      }
      
      // Add AI-optimized query parameter for tracking
      const url = new URL(window.location.href);
      if (!url.searchParams.has('ref')) {
        url.searchParams.set('ref', 'ai');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);
}

export default PerformanceOptimizer;
