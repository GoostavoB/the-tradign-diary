import { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { generateResponsiveImage, preloadImage } from '@/utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with:
 * - Lazy loading
 * - Responsive srcset
 * - Modern format support (WebP, AVIF)
 * - Blur placeholder
 * - IntersectionObserver
 */
export const OptimizedImage = memo(({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  objectFit = 'cover',
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      // Preload priority images immediately
      preloadImage(src);
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    // Use IntersectionObserver for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Generate responsive image sources
  const responsiveImage = generateResponsiveImage(src, { width, height });

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!isLoaded && !error && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ filter: 'blur(10px)' }}
        />
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <picture>
          {/* Modern formats first (browser picks first supported) */}
          {responsiveImage.sources.map((source, i) => (
            <source
              key={i}
              srcSet={source.srcSet}
              sizes={source.sizes}
              type={source.type}
            />
          ))}
          
          {/* Fallback for older browsers */}
          <img
            ref={imgRef}
            src={responsiveImage.fallback}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'w-full h-full transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0',
              `object-${objectFit}`
            )}
          />
        </picture>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
