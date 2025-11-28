import { memo, Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardTab } from './DashboardTabs';

// Lazy load heavy components
const Analytics = lazy(() => import('@/pages/Analytics'));
const Journal = lazy(() => import('@/pages/Journal'));

interface DashboardViewProps {
    activeTab: DashboardTab;
    children?: React.ReactNode; // Content for 'main' and 'custom' dashboards (the widget grid)
}

export const DashboardView = memo(({ activeTab, children }: DashboardViewProps) => {
    if (activeTab.type === 'insights') {
        return (
            <Suspense fallback={<LoadingState />}>
                <div className="h-full overflow-auto p-6">
                    <Analytics />
                </div>
            </Suspense>
        );
    }

    if (activeTab.type === 'trade-history') {
        return (
            <Suspense fallback={<LoadingState />}>
                <div className="h-full overflow-auto p-6">
                    <Journal />
                </div>
            </Suspense>
        );
    }

    // For 'main' and 'custom' types, render the passed children (Widget Grid)
    return (
        <div className="h-full overflow-hidden bg-background/50">
            {children}
        </div>
    );
});

DashboardView.displayName = 'DashboardView';

const LoadingState = () => (
    <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
);
