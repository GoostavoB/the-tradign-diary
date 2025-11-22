/**
 * Default Grid Layouts
 * 
 * Predefined layouts for Overview and TradeStation dashboards
 */

import { GridWidget } from '@/types/grid';
import { getWidgetGridConfig } from './widgetGridConfigs';

/**
 * Create a GridWidget from a widget ID with default positioning
 */
function createGridWidget(
    id: string,
    x: number,
    y: number,
    customSize?: number,
    customHeight?: number
): GridWidget {
    const gridConfig = getWidgetGridConfig(id);

    return {
        id,
        x,
        y,
        width: customSize || gridConfig.defaultSize,
        height: customHeight || gridConfig.defaultHeight,
        minSize: gridConfig.minSize,
        type: gridConfig.type,
        hasChart: gridConfig.hasChart,
        hasImage: gridConfig.hasImage,
    };
}

/**
 * Default Overview Dashboard Layout
 * 
 * Grid: 12 columns × 8 rows
 * Comprehensive performance overview
 */
export const DEFAULT_OVERVIEW_LAYOUT: GridWidget[] = [
    // Row 0: Small metrics (4 widgets, 2 units each + 1 each + fill)
    createGridWidget('totalBalance', 0, 0, 2, 2),
    createGridWidget('winRate', 2, 0, 2, 2),
    createGridWidget('currentROI', 4, 0, 2, 2),
    createGridWidget('avgPnLPerDay', 6, 0, 2, 2),
    createGridWidget('weightedAvgROI', 8, 0, 2, 2),
    createGridWidget('totalTrades', 10, 0, 2, 2),

    // Row 1: Capital Growth (6 units) + Top Movers (4 units) + Quick Actions (2 units)
    createGridWidget('capitalGrowth', 0, 1, 6, 3),
    createGridWidget('topMovers', 6, 1, 4, 2),
    createGridWidget('quickActions', 10, 1, 2, 2),

    // Row 2: Goals (4 units) + Combined PnL/ROI (6 units)
    createGridWidget('goals', 6, 2, 4, 2),
    createGridWidget('combinedPnLROI', 0, 3, 6, 2),

    // Row 3: AI Insights (6 units) + Cost Efficiency (4 units)
    createGridWidget('aiInsights', 6, 3, 6, 3),

    // Row 4: Behavior Analytics (6 units) + Trading Quality (4 units)
    createGridWidget('behaviorAnalytics', 0, 4, 6, 3),
    createGridWidget('costEfficiency', 6, 4, 4, 2),
    createGridWidget('tradingQuality', 10, 4, 2, 2),

    // Row 5: Emotion/Mistake Correlation (full width 12 units)
    createGridWidget('emotionMistakeCorrelation', 0, 5, 12, 3),

    // Row 6: Performance Highlights (6 units) + Portfolio (6 units)
    createGridWidget('performanceHighlights', 0, 6, 6, 2),
    createGridWidget('portfolioOverview', 6, 6, 6, 3),
];

/**
 * Default TradeStation Layout
 * 
 * Grid: 12 columns × 6 rows
 * Focused on trade execution and risk management
 */
export const DEFAULT_TRADESTATION_LAYOUT: GridWidget[] = [
    // Row 0: Daily Loss Lock (2) + Simple Leverage (4) + Rolling Target (6)
    createGridWidget('dailyLossLock', 0, 0, 2, 2),
    createGridWidget('simpleLeverage', 2, 0, 4, 3),
    createGridWidget('rollingTarget', 6, 0, 6, 2),

    // Row 1: Risk Calculator (6) + Error Reflection (6)
    createGridWidget('riskCalculator', 0, 1, 6, 3),
    createGridWidget('errorReflection', 6, 1, 6, 3),

    // Row 2: Win Rate (2) + Total Balance (2) + Current ROI (2) + Top Movers (6)
    createGridWidget('winRate', 0, 2, 2, 2),
    createGridWidget('totalBalance', 2, 2, 2, 2),
    createGridWidget('currentROI', 4, 2, 2, 2),
    createGridWidget('topMovers', 6, 2, 6, 2),

    // Row 3: Quick Actions (4) + Recent Transactions (8)
    createGridWidget('quickActions', 0, 3, 4, 2),
    createGridWidget('recentTransactions', 4, 3, 8, 2),
];

/**
 * Minimal starter layout for new users
 */
export const MINIMAL_STARTER_LAYOUT: GridWidget[] = [
    createGridWidget('totalBalance', 0, 0, 4, 2),
    createGridWidget('winRate', 4, 0, 4, 2),
    createGridWidget('currentROI', 8, 0, 4, 2),
    createGridWidget('capitalGrowth', 0, 1, 12, 3),
    createGridWidget('recentTransactions', 0, 3, 12, 2),
];
