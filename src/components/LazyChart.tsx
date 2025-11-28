import { ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyChartProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

/**
 * Wrapper component for lazy loading charts
 * Only renders chart when it enters viewport
 * Improves initial page load performance
 */
export const LazyChart = ({ children, height = 280, className = '' }: LazyChartProps) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    freezeOnceVisible: true,
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        children
      ) : (
        <Skeleton className="w-full" style={{ height: `${height}px` }} />
      )}
    </div>
  );
};
