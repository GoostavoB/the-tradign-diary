import { memo, useEffect, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyChartProps {
  children: React.ReactNode;
  height?: number;
  minHeight?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Wrapper component that lazy loads charts when they enter the viewport
 * Significantly improves initial page load by deferring chart rendering
 */
export const LazyChart = memo(({ 
  children, 
  height = 300, 
  minHeight,
  className = '',
  threshold = 0.1,
  rootMargin = '100px'
}: LazyChartProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Use IntersectionObserver to detect when chart enters viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded) {
            setIsVisible(true);
            setHasLoaded(true);
            // Once loaded, stop observing
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasLoaded, threshold, rootMargin]);

  const style = minHeight ? { minHeight: `${minHeight}px` } : { height: `${height}px` };

  return (
    <div ref={elementRef} className={className} style={style}>
      {isVisible ? (
        children
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}
    </div>
  );
});

LazyChart.displayName = 'LazyChart';
