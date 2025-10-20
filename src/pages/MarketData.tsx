import AppLayout from '@/components/layout/AppLayout';
import { TrendingUp } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';

// Lazy load heavy components
const LongShortRatioContent = lazy(() => import('@/pages/LongShortRatio').then(m => ({ default: () => {
  const Component = m.default;
  return <Component />;
}})));

const MarketData = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Market Data</h1>
          <p className="text-muted-foreground mt-1">
            Monitor market sentiment indicators
          </p>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <LongShortRatioContent />
        </Suspense>
      </div>
    </AppLayout>
  );
};

export default MarketData;
