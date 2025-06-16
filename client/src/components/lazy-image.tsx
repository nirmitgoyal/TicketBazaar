import { useState, useRef, useEffect } from "react";
import { createLazyLoader } from "@/utils/performance";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  style?: React.CSSProperties;
}

/**
 * Optimized lazy loading image component with blur placeholder
 */
export function LazyImage({
  src,
  alt,
  className,
  placeholder = '/placeholder.svg',
  blurDataURL,
  onLoad,
  onError,
  priority = false,
  style,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (priority) return;

    const element = imgRef.current;
    if (!element) return;

    observerRef.current = createLazyLoader(
      (entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.unobserve(element);
        }
      },
      { rootMargin: '100px' }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
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
    <div ref={imgRef} className={cn("relative overflow-hidden", className)} style={style}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Placeholder */}
      {!blurDataURL && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded" />
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <img
          src={placeholder}
          alt={alt}
          className="w-full h-full object-cover opacity-60"
          onLoad={handleLoad}
        />
      )}
    </div>
  );
}

/**
 * Optimized image with responsive sizes
 */
interface ResponsiveImageProps extends LazyImageProps {
  sizes?: string;
  srcSet?: string;
  width?: number;
  height?: number;
}

export function ResponsiveImage({
  src,
  srcSet,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  width,
  height,
  ...props
}: ResponsiveImageProps) {
  return (
    <LazyImage
      {...props}
      src={src}
      className={cn(props.className)}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        ...props.style,
      }}
    />
  );
}