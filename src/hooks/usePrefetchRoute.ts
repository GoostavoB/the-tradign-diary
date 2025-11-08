import { useCallback } from 'react';

// Map of routes to their lazy component imports
const routePrefetchMap: Record<string, () => Promise<any>> = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/upload': () => import('@/pages/Upload'),
  '/analytics': () => import('@/pages/Analytics'),
  '/market-data': () => import('@/pages/MarketData'),
  '/settings': () => import('@/pages/Settings'),
  '/journal': () => import('@/pages/Journal'),
  '/goals': () => import('@/pages/Goals'),
  '/psychology': () => import('@/pages/Psychology'),
  '/trading-plan': () => import('@/pages/TradingPlan'),
  '/spot-wallet': () => import('@/pages/SpotWallet'),
  '/track-capital': () => import('@/pages/TrackCapital'),
  '/fee-analysis': () => import('@/pages/FeeAnalysis'),
  '/risk-management': () => import('@/pages/RiskManagement'),
  '/gamification': () => import('@/pages/Gamification'),
  '/achievements': () => import('@/pages/Achievements'),
  '/forecast': () => import('@/pages/Forecast'),
  '/ai-tools': () => import('@/pages/AITools'),
  '/reports': () => import('@/pages/Reports'),
  '/leaderboard': () => import('@/pages/Leaderboard'),
  '/friend-leaderboard': () => import('@/pages/FriendLeaderboard'),
  '/long-short-ratio': () => import('@/pages/LongShortRatio'),
  '/tax-reports': () => import('@/pages/TaxReports'),
  '/withdrawals': () => import('@/pages/Withdrawals'),
  '/my-metrics': () => import('@/pages/MyMetrics'),
  '/user-guide': () => import('@/pages/UserGuide'),
  '/accessibility': () => import('@/pages/AccessibilityGuide'),
  '/support': () => import('@/pages/Support'),
  '/calculators': () => import('@/pages/Calculators'),
  '/learn': () => import('@/pages/Learn'),
  '/api-docs': () => import('@/pages/ApiDocs'),
  '/advanced-analytics': () => import('@/pages/AdvancedAnalytics'),
  '/upgrade': () => import('@/pages/Upgrade'),
  '/credits/purchase': () => import('@/pages/CreditsPurchase'),
};

// Cache to track which routes have been prefetched
const prefetchCache = new Set<string>();

/**
 * Hook to prefetch route components on hover
 * Reduces perceived loading time by preloading components before navigation
 */
export function usePrefetchRoute() {
  const prefetch = useCallback((path: string) => {
    // Strip query params for matching
    const cleanPath = path.split('?')[0];
    
    // If already prefetched or not in map, skip
    if (prefetchCache.has(cleanPath) || !routePrefetchMap[cleanPath]) {
      return;
    }

    // Mark as prefetched immediately to prevent duplicate fetches
    prefetchCache.add(cleanPath);

    // Prefetch the component
    routePrefetchMap[cleanPath]()
      .then(() => {
        console.log(`[Prefetch] Successfully prefetched: ${cleanPath}`);
      })
      .catch((error) => {
        console.warn(`[Prefetch] Failed to prefetch ${cleanPath}:`, error);
        // Remove from cache on error so it can be retried
        prefetchCache.delete(cleanPath);
      });
  }, []);

  return { prefetch };
}
