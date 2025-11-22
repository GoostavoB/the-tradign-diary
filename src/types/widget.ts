import { LucideIcon } from 'lucide-react';

// Standardized widget sizes: 1, 2, 4, 6 (in subcolumns, total grid = 6 subcolumns)
export type WidgetSize = 1 | 2 | 4 | 6;

// Widget height options: 2, 4, 6 (rows)
export type WidgetHeight = 2 | 4 | 6;

// Legacy size names for compatibility with existing config
export type WidgetSizeName = 'small' | 'medium' | 'large' | 'xlarge';

export interface WidgetLayout {
  i: string; // widget ID
  x: number;
  y: number;
  w: number; // width in grid columns (out of 12)
  h: number; // height in grid rows
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

// Widget size configuration for the new 6-subcolumn system
export interface WidgetSizeConfig {
  id: string;
  size: WidgetSize;
  height?: 'small' | 'medium' | 'large'; // Standardized heights
}

export interface WidgetConfig {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  icon: LucideIcon;
  defaultSize: WidgetSizeName; // Legacy size name
  defaultLayout?: Pick<WidgetLayout, 'w' | 'h' | 'minW' | 'minH' | 'maxW' | 'maxH'>;
  component: React.ComponentType<WidgetProps>;
  isPremium?: boolean;
  requiresData?: string[]; // Dependencies like 'trades', 'holdings'
}

export interface WidgetProps {
  id: string;
  isEditMode?: boolean;
  onRemove?: () => void;
  onExpand?: () => void;
  // Props that will be passed from Dashboard
  [key: string]: any;
}

export type WidgetCategory = 
  | 'trading'
  | 'market'
  | 'portfolio'
  | 'performance'
  | 'insights'
  | 'ai'
  | 'overview';

export interface UserWidgetLayout {
  user_id: string;
  layout: WidgetLayout[];
  updated_at: string;
}

// Size presets for common widget dimensions
export const WIDGET_SIZES: Record<WidgetSize, Pick<WidgetLayout, 'w' | 'h'>> = {
  1: { w: 2, h: 2 },    // 1 subcolumn
  2: { w: 4, h: 3 },    // 1 full column (2 subcolumns)
  4: { w: 8, h: 3 },    // 2 columns (4 subcolumns)
  6: { w: 12, h: 4 },   // 3 columns (6 subcolumns)
};

// Default widget size configurations
export const WIDGET_SIZE_MAP: Record<string, WidgetSize> = {
  // Size 1 widgets (occupy 1 subcolumn) - small metrics
  'totalBalance': 1,
  'winRate': 1,
  'avgPnLPerDay': 1,
  'currentROI': 1,
  'avgPnLPerTrade': 1,
  'spotWallet': 1,
  'weightedAvgROI': 1,
  'totalTrades': 1,
  'simpleAvgROI': 1,
  'avgROIPerTrade': 1,
  'dailyLossLock': 1,
  'simpleLeverage': 1,
  'quickActions': 1,
  
  // Size 2 widgets (occupy 1 full column = 2 subcolumns)
  'goals': 2,
  'capitalGrowth': 2,
  'topMovers': 2,
  'behaviorAnalytics': 2,
  'costEfficiency': 2,
  'tradingQuality': 2,
  'performanceHighlights': 2,
  'portfolioOverview': 2,
  'recentTransactions': 2,
  'riskCalculator': 2,
  'errorReflection': 2,
  'heatmap': 2,
  
  // Size 4 widgets (occupy 2 columns = 4 subcolumns)
  'combinedPnLROI': 4,
  'aiInsights': 4,
  'emotionMistakeCorrelation': 4,
  
  // Size 6 widgets (occupy 3 columns = 6 subcolumns, full width)
  'rollingTarget': 6,
};

// Trade Station widget sizes
export const TRADE_STATION_WIDGET_SIZE_MAP: Record<string, WidgetSize> = {
  'simpleLeverage': 2,
  'riskCalculator': 2,
  'errorReflection': 2,
  'rollingTarget': 6,
};

// Helper functions for widget sizing during migration
export function getDefaultSizeForWidget(widgetId: string, isTradeStation = false): WidgetSize {
  const sizeMap = isTradeStation ? TRADE_STATION_WIDGET_SIZE_MAP : WIDGET_SIZE_MAP;
  return sizeMap[widgetId] || 2; // Default to size 2 if not found
}

export function getDefaultHeightForWidget(widgetId: string, size?: WidgetSize): WidgetHeight {
  // Size 1 widgets always have height 2
  const widgetSize = size ?? getDefaultSizeForWidget(widgetId);
  if (widgetSize === 1) {
    return 2;
  }
  
  // Large widgets get height 4
  const largeWidgets = ['portfolioOverview', 'rollingTarget', 'behaviorAnalytics', 'aiInsights', 'emotionMistakeCorrelation'];
  if (largeWidgets.includes(widgetId)) {
    return 4;
  }
  
  // Default height
  return 2;
}
