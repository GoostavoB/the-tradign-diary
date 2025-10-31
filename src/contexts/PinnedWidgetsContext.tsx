import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type WidgetId = 
  | 'totalBalance'
  | 'winRate'
  | 'totalTrades'
  | 'spotWallet'
  | 'absoluteProfit'
  | 'topMovers'
  | 'aiInsights'
  | 'recentTransactions'
  | 'quickActions'
  | 'avgPnLPerTrade'
  | 'avgPnLPerDay'
  | 'avgROIPerTrade'
  | 'currentROI'
  | 'capitalGrowth'
  | 'portfolioOverview'
  | 'behaviorAnalytics'
  | 'costEfficiency'
  | 'performanceHighlights'
  | 'tradingQuality'
  | 'heatmap'
  | 'goals'
  | 'lsrMarketData'
  | 'openInterestChart'
  | 'leverageCalculator'
  | 'weekPerformance'
  | 'weeklyPnLChart';

// Map catalog widget IDs to pinned widget IDs (they're the same now)
export const CATALOG_TO_PINNED_MAP: Record<string, WidgetId> = {
  'totalBalance': 'totalBalance',
  'winRate': 'winRate',
  'totalTrades': 'totalTrades',
  'spotWallet': 'spotWallet',
  'absoluteProfit': 'absoluteProfit',
  'topMovers': 'topMovers',
  'aiInsights': 'aiInsights',
  'recentTransactions': 'recentTransactions',
  'quickActions': 'quickActions',
  'avgPnLPerTrade': 'avgPnLPerTrade',
  'avgPnLPerDay': 'avgPnLPerDay',
  'avgROIPerTrade': 'avgROIPerTrade',
  'currentROI': 'currentROI',
  'capitalGrowth': 'capitalGrowth',
  'portfolioOverview': 'portfolioOverview',
  'behaviorAnalytics': 'behaviorAnalytics',
  'costEfficiency': 'costEfficiency',
  'performanceHighlights': 'performanceHighlights',
  'tradingQuality': 'tradingQuality',
  'heatmap': 'heatmap',
  'goals': 'goals',
  'lsrMarketData': 'lsrMarketData',
  'openInterestChart': 'openInterestChart',
  'leverageCalculator': 'leverageCalculator',
  'weekPerformance': 'weekPerformance',
  'weeklyPnLChart': 'weeklyPnLChart',
};

interface PinnedWidgetsContextType {
  pinnedWidgets: WidgetId[];
  isPinned: (widgetId: WidgetId) => boolean;
  togglePin: (widgetId: WidgetId) => void;
  pinWidget: (widgetId: WidgetId) => void;
  unpinWidget: (widgetId: WidgetId) => void;
}

const PinnedWidgetsContext = createContext<PinnedWidgetsContextType | undefined>(undefined);

const DEFAULT_PINNED_WIDGETS: WidgetId[] = [];

const STORAGE_KEY = 'pinned-widgets';

export function PinnedWidgetsProvider({ children }: { children: ReactNode }) {
  const [pinnedWidgets, setPinnedWidgets] = useState<WidgetId[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PINNED_WIDGETS;
      }
    }
    return DEFAULT_PINNED_WIDGETS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedWidgets));
  }, [pinnedWidgets]);

  const isPinned = (widgetId: WidgetId) => pinnedWidgets.includes(widgetId);

  const togglePin = (widgetId: WidgetId) => {
    setPinnedWidgets(prev => 
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const pinWidget = (widgetId: WidgetId) => {
    setPinnedWidgets(prev => 
      prev.includes(widgetId) ? prev : [...prev, widgetId]
    );
  };

  const unpinWidget = (widgetId: WidgetId) => {
    setPinnedWidgets(prev => prev.filter(id => id !== widgetId));
  };

  return (
    <PinnedWidgetsContext.Provider
      value={{
        pinnedWidgets,
        isPinned,
        togglePin,
        pinWidget,
        unpinWidget,
      }}
    >
      {children}
    </PinnedWidgetsContext.Provider>
  );
}

export function usePinnedWidgets() {
  const context = useContext(PinnedWidgetsContext);
  if (!context) {
    throw new Error('usePinnedWidgets must be used within PinnedWidgetsProvider');
  }
  return context;
}
