import { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderClassName?: string;
  lazy?: boolean;
  aspectRatio?: string;
}

/**
 * Optimized image component with lazy loading, blur placeholder, and fade-in animation
 * Automatically loads images when they enter viewport with intersection observer
 * Supports aspect ratio to prevent layout shift
 */
const OptimizedImageComponent = ({
  src,
  alt,
  className,
  placeholderClassName,
  lazy = true,
  aspectRatio,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.01 } // Start loading 100px before visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy]);

  return (
    <div 
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Animated blur placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/5 to-muted animate-pulse',
            placeholderClassName
          )}
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-500 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

export const OptimizedImage = memo(OptimizedImageComponent);
