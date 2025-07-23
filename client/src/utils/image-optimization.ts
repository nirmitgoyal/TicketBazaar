/**
 * Advanced Image Optimization for SEO and Performance
 * Includes WebP conversion, lazy loading, and responsive images
 */

import React from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  lazy?: boolean;
  responsive?: boolean;
  sizes?: string;
  srcset?: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  fetchpriority?: 'high' | 'low' | 'auto';
}

interface ResponsiveBreakpoint {
  width: number;
  quality?: number;
  format?: string;
}

/**
 * Create optimized image component with SEO benefits
 */
export function createOptimizedImage(
  src: string, 
  options: ImageOptimizationOptions
): string {
  const {
    quality = 85,
    format = 'webp',
    lazy = true,
    responsive = true,
    alt,
    loading = lazy ? 'lazy' : 'eager',
    fetchpriority = 'auto',
    sizes,
    srcset
  } = options;

  // Generate WebP and fallback sources
  const webpSrc = convertToWebP(src, quality);
  const fallbackSrc = src;

  // Generate responsive srcset if needed
  const responsiveSrcset = responsive ? generateResponsiveSrcset(src, quality) : srcset;
  const responsiveSizes = responsive ? generateSizes() : sizes;

  return `
    <picture>
      <source 
        srcset="${responsiveSrcset || webpSrc}" 
        type="image/webp" 
        ${responsiveSizes ? `sizes="${responsiveSizes}"` : ''}
      />
      <img 
        src="${fallbackSrc}"
        alt="${alt}"
        loading="${loading}"
        fetchpriority="${fetchpriority}"
        ${responsiveSrcset ? `srcset="${responsiveSrcset}"` : ''}
        ${responsiveSizes ? `sizes="${responsiveSizes}"` : ''}
        style="width: 100%; height: auto;"
        onload="this.style.opacity=1"
        style="opacity: 0; transition: opacity 0.3s;"
      />
    </picture>
  `.trim();
}

/**
 * Convert image to WebP format with optimization
 */
function convertToWebP(src: string, quality: number = 85): string {
  // In a real implementation, this would handle actual conversion
  // For now, we'll assume WebP versions exist
  const extension = src.split('.').pop()?.toLowerCase();
  if (extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return src;
}

/**
 * Generate responsive srcset for different screen sizes
 */
function generateResponsiveSrcset(src: string, quality: number = 85): string {
  const breakpoints: ResponsiveBreakpoint[] = [
    { width: 320, quality: 75 },
    { width: 640, quality: 80 },
    { width: 768, quality: 85 },
    { width: 1024, quality: 85 },
    { width: 1280, quality: 90 },
    { width: 1920, quality: 90 }
  ];

  return breakpoints
    .map(bp => {
      const optimizedSrc = generateResponsiveUrl(src, bp.width, bp.quality || quality);
      return `${optimizedSrc} ${bp.width}w`;
    })
    .join(', ');
}

/**
 * Generate responsive image URL
 */
function generateResponsiveUrl(src: string, width: number, quality: number): string {
  // In production, this would integrate with your image optimization service
  const webpSrc = convertToWebP(src, quality);
  return `${webpSrc}?w=${width}&q=${quality}`;
}

/**
 * Generate responsive sizes attribute
 */
function generateSizes(): string {
  return `
    (max-width: 320px) 320px,
    (max-width: 640px) 640px,
    (max-width: 768px) 768px,
    (max-width: 1024px) 1024px,
    (max-width: 1280px) 1280px,
    1920px
  `.replace(/\s+/g, ' ').trim();
}

/**
 * Lazy loading intersection observer
 */
class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    this.initializeObserver();
  }

  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
            this.images.delete(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  }

  observeImage(img: HTMLImageElement): void {
    if (this.observer && !this.images.has(img)) {
      this.images.add(img);
      this.observer.observe(img);
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const dataSrc = img.dataset.src;
    const dataSrcset = img.dataset.srcset;

    if (dataSrc) {
      img.src = dataSrc;
    }
    if (dataSrcset) {
      img.srcset = dataSrcset;
    }

    img.classList.add('loaded');
    
    // Trigger load event for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_lazy_loaded', {
        event_category: 'Performance',
        event_label: img.alt || 'Unnamed Image'
      });
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Export singleton
export const lazyImageLoader = new LazyImageLoader();

/**
 * React component for optimized images
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  responsive?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  style = {},
  priority = false,
  responsive = true,
  quality = 85,
  onLoad,
  onError
}: OptimizedImageProps): JSX.Element {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Generate optimized sources
  const webpSrc = convertToWebP(src, quality);
  const responsiveSrcset = responsive ? generateResponsiveSrcset(src, quality) : undefined;
  const sizes = responsive ? generateSizes() : undefined;

  React.useEffect(() => {
    const img = imgRef.current;
    if (!img || priority) return;

    // Use lazy loading for non-priority images
    lazyImageLoader.observeImage(img);

    return () => {
      // Cleanup handled by LazyImageLoader
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <picture className={`optimized-image ${className}`} style={style}>
      <source 
        srcSet={responsiveSrcset || webpSrc} 
        type="image/webp"
        sizes={sizes}
      />
      <img
        ref={imgRef}
        src={priority ? src : undefined}
        data-src={priority ? undefined : src}
        data-srcset={priority ? undefined : responsiveSrcset}
        srcSet={priority ? responsiveSrcset : undefined}
        sizes={priority ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: 'auto',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          ...style
        }}
        className={`
          ${isLoaded ? 'loaded' : 'loading'} 
          ${hasError ? 'error' : ''}
        `.trim()}
      />
    </picture>
  );
}

/**
 * Preload critical images for better LCP
 */
export function preloadCriticalImages(images: string[]): void {
  if (typeof document === 'undefined') return;

  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = convertToWebP(src, 90);
    link.type = 'image/webp';
    document.head.appendChild(link);
  });
}

/**
 * Image optimization utility functions
 */
export const ImageOptimization = {
  /**
   * Calculate optimal image dimensions
   */
  calculateOptimalSize(containerWidth: number, devicePixelRatio: number = 1): number {
    return Math.ceil(containerWidth * devicePixelRatio);
  },

  /**
   * Get image format based on browser support
   */
  getSupportedFormat(): 'webp' | 'avif' | 'jpeg' {
    if (typeof window === 'undefined') return 'jpeg';

    // Check AVIF support
    const avifCanvas = document.createElement('canvas');
    avifCanvas.width = 1;
    avifCanvas.height = 1;
    if (avifCanvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
      return 'avif';
    }

    // Check WebP support
    const webpCanvas = document.createElement('canvas');
    webpCanvas.width = 1;
    webpCanvas.height = 1;
    if (webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      return 'webp';
    }

    return 'jpeg';
  },

  /**
   * Measure image load performance
   */
  measureImageLoadTime(src: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        resolve(loadTime);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      
      img.src = src;
    });
  }
};

/**
 * Initialize image optimization
 */
export function initializeImageOptimization(): void {
  if (typeof window === 'undefined') return;

  // Preload critical images
  const criticalImages = [
    '/logo.svg',
    '/images/hero-banner.webp'
  ];
  
  preloadCriticalImages(criticalImages);

  // Add CSS for image optimization
  if (!document.getElementById('image-optimization-styles')) {
    const style = document.createElement('style');
    style.id = 'image-optimization-styles';
    style.textContent = `
      .optimized-image img {
        transition: opacity 0.3s ease-in-out;
      }
      
      .optimized-image img.loading {
        opacity: 0;
      }
      
      .optimized-image img.loaded {
        opacity: 1;
      }
      
      .optimized-image img.error {
        opacity: 0.5;
        filter: grayscale(100%);
      }
    `;
    document.head.appendChild(style);
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeImageOptimization);
}