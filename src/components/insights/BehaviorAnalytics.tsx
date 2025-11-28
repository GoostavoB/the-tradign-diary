import { memo, useMemo } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Calendar, DollarSign, Activity } from 'lucide-react';
import { formatCurrency } from '@/utils/formatNumber';
import {
  calculateAvgHoldingTime,
  calculateAvgPositionSize,
  calculateAvgLeverage,
  analyzeHourlyPerformance,
  analyzeDayPerformance
} from '@/utils/insightCalculations';
import type { Trade } from '@/types/trade';
import { useTranslation } from '@/hooks/useTranslation';

interface BehaviorAnalyticsProps {
  trades: Trade[];
}

export const BehaviorAnalytics = memo(({ trades }: BehaviorAnalyticsProps) => {
  const { t } = useTranslation();

  // Add defensive check for trades
  if (!trades || trades.length === 0) {
    return (
      <PremiumCard className="p-6 bg-card border-border">
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('insights.noDataAvailable') || 'No data available'}</p>
        </div>
      </PremiumCard>
    );
  }

  const avgHoldingTime = useMemo(() => calculateAvgHoldingTime(trades), [trades]);
  const avgPositionSize = useMemo(() => calculateAvgPositionSize(trades), [trades]);
  const avgLeverage = useMemo(() => calculateAvgLeverage(trades), [trades]);
  const dayPerf = useMemo(() => analyzeDayPerformance(trades), [trades]);

  const { bestDay, worstDay } = useMemo(() => {
    if (!dayPerf || dayPerf.length === 0) {
      return {
        bestDay: { day: 'N/A', totalPnL: 0, tradeCount: 0 },
        worstDay: { day: 'N/A', totalPnL: 0, tradeCount: 0 }
      };
    }
    const sorted = [...dayPerf].sort((a, b) => b.totalPnL - a.totalPnL);
    return {
      bestDay: sorted[0],
      worstDay: sorted[sorted.length - 1]
    };
  }, [dayPerf]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Average Holding Time */}
        <PremiumCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">{t('insights.avgHoldingTime') || 'Avg Holding Time'}</p>
          </div>
          <p className="text-lg font-bold">{avgHoldingTime}</p>
        </PremiumCard>

        {/* Average Position Size */}
        <PremiumCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">{t('insights.avgPositionSize') || 'Avg Position Size'}</p>
          </div>
          <p className="text-lg font-bold">{formatCurrency(avgPositionSize)}</p>
        </PremiumCard>

        {/* Average Leverage */}
        <PremiumCard className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">{t('insights.avgLeverage') || 'Avg Leverage'}</p>
          </div>
          <p className="text-lg font-bold">{avgLeverage.toFixed(1)}x</p>
        </PremiumCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PremiumCard className="p-4 bg-green-500/5 border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-green-500" />
            <p className="text-xs font-medium text-green-500">{t('insights.bestDayOfWeek') || 'Best Day'}</p>
          </div>
          <p className="text-lg font-bold">{bestDay.day}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(bestDay.totalPnL)} • {bestDay.tradeCount} {t('insights.trades') || 'trades'}
          </p>
        </PremiumCard>

        <PremiumCard className="p-4 bg-red-500/5 border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-red-500" />
            <p className="text-xs font-medium text-red-500">{t('insights.worstDayOfWeek') || 'Worst Day'}</p>
          </div>
          <p className="text-lg font-bold">{worstDay.day}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(worstDay.totalPnL)} • {worstDay.tradeCount} {t('insights.trades') || 'trades'}
          </p>
        </PremiumCard>
      </div>
    </div>
  );
});

BehaviorAnalytics.displayName = 'BehaviorAnalytics';
