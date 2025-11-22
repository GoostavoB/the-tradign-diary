/**
 * Widget Grid Configurations
 * 
 * Defines grid metadata for all widgets including:
 * - Type (simple, visual, calc)
 * - Content flags (hasChart, hasImage)
 * - Size constraints (minSize, defaultSize, defaultHeight)
 */

import { WidgetGridConfig } from '@/types/grid';

export const WIDGET_GRID_CONFIGS: Record<string, WidgetGridConfig> = {
    // Simple widgets (size 1-2)
    totalBalance: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    winRate: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    totalTrades: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    spotWallet: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    avgPnLPerTrade: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    avgPnLPerDay: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    currentROI: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    avgROIPerTrade: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    simpleAvgROI: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    weightedAvgROI: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    quickActions: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    dailyLossLock: {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 1,
        defaultSize: 2,
        defaultHeight: 2,
    },

    simpleLeverage: {
        type: 'calc',
        hasChart: false,
        hasImage: false,
        minSize: 4,
        defaultSize: 4,
        defaultHeight: 2,
    },

    // Visual widgets with charts (min size 4)
    portfolioOverview: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 3,
    },

    capitalGrowth: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 3,
    },

    topMovers: {
        type: 'visual',
        hasChart: false,
        hasImage: false,
        minSize: 4,
        defaultSize: 4,
        defaultHeight: 2,
    },

    combinedPnLROI: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 2,
    },

    aiInsights: {
        type: 'visual',
        hasChart: false,
        hasImage: true, // Has AI avatar/icons
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 3,
    },

    recentTransactions: {
        type: 'visual',
        hasChart: false,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 2,
    },

    behaviorAnalytics: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 3,
    },

    costEfficiency: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 4,
        defaultHeight: 2,
    },

    performanceHighlights: {
        type: 'visual',
        hasChart: false,
        hasImage: false,
        minSize: 4,
        defaultSize: 4,
        defaultHeight: 2,
    },

    tradingQuality: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 4,
        defaultHeight: 2,
    },

    emotionMistakeCorrelation: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 8,
        defaultHeight: 3,
    },

    heatmap: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 6,
        defaultSize: 12,
        defaultHeight: 3,
    },

    goals: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 3,
    },

    rollingTarget: {
        type: 'visual',
        hasChart: true,
        hasImage: false,
        minSize: 6,
        defaultSize: 12,
        defaultHeight: 2,
    },

    // Calculation widgets (min size 4)
    riskCalculator: {
        type: 'calc',
        hasChart: false,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 3,
    },

    errorReflection: {
        type: 'calc',
        hasChart: false,
        hasImage: false,
        minSize: 4,
        defaultSize: 6,
        defaultHeight: 3,
    },
};

/**
 * Get grid configuration for a widget
 */
export function getWidgetGridConfig(widgetId: string): WidgetGridConfig {
    return WIDGET_GRID_CONFIGS[widgetId] || {
        type: 'simple',
        hasChart: false,
        hasImage: false,
        minSize: 2,
        defaultSize: 4,
        defaultHeight: 2,
    };
}
