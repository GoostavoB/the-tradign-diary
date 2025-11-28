import { Suspense, ReactNode, memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PremiumCard } from '@/components/ui/PremiumCard';

interface LoadingBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  height?: number;
  variant?: 'card' | 'skeleton' | 'spinner';
}

/**
 * Suspense boundary with customizable loading states
 * Provides consistent loading experience across the app
 */
const LoadingBoundaryComponent = ({
  children,
  fallback,
  height = 200,
  variant = 'skeleton',
}: LoadingBoundaryProps) => {
  const defaultFallback = () => {
    switch (variant) {
      case 'card':
        return (
          <PremiumCard className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </PremiumCard>
        );
      case 'spinner':
        return (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        );
      default:
        return <Skeleton className="w-full" style={{ height }} />;
    }
  };

  return (
    <Suspense fallback={fallback || defaultFallback()}>
      {children}
    </Suspense>
  );
};

export const LoadingBoundary = memo(LoadingBoundaryComponent);
