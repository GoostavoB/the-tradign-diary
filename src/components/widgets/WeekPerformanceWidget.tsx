import { useMemo } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WidgetProps } from '@/types/widget';
import { WidgetWrapper } from './WidgetWrapper';
import { ProfitLossHighlight } from '@/components/ProfitLossHighlight';
import type { Trade } from '@/types/trade';

interface WeekPerformanceWidgetProps extends WidgetProps {
  trades?: Trade[];
}

export const WeekPerformanceWidget = ({ id, trades = [], ...props }: WeekPerformanceWidgetProps) => {
  const weekStats = useMemo(() => {
    // Get current week's Monday 00:00
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0);

    // Filter trades from this week
    const weekTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.opened_at || trade.created_at);
      return tradeDate >= monday;
    });

    const totalPnL = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winningTrades = weekTrades.filter(t => (t.pnl || 0) > 0).length;
    const losingTrades = weekTrades.filter(t => (t.pnl || 0) <= 0).length;
    const winRate = weekTrades.length > 0 ? (winningTrades / weekTrades.length) * 100 : 0;

    return {
      totalPnL,
      tradeCount: weekTrades.length,
      winningTrades,
      losingTrades,
      winRate,
      weekStart: monday,
    };
  }, [trades]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const weekEnd = new Date(weekStats.weekStart);
  weekEnd.setDate(weekStats.weekStart.getDate() + 6);

  return (
    <WidgetWrapper
      id={id}
      title="Week Performance"
      {...props}
    >
      <Card className="h-full bg-gradient-to-br from-background to-accent/5 border-border/50">
        <div className="p-6 space-y-6">
          {/* Week Range */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(weekStats.weekStart)} - {formatDate(weekEnd)}
            </span>
          </div>

          {/* Main PnL Display */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">This Week's P&L</div>
            <ProfitLossHighlight
              value={weekStats.totalPnL}
              prefix="$"
              size="lg"
              showIcon
              className="font-bold text-3xl"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Trades</div>
              <div className="text-lg font-semibold">{weekStats.tradeCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Win Rate</div>
              <div className="text-lg font-semibold text-success">
                {weekStats.winRate.toFixed(0)}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">W/L</div>
              <div className="text-lg font-semibold">
                <span className="text-success">{weekStats.winningTrades}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-destructive">{weekStats.losingTrades}</span>
              </div>
            </div>
          </div>

          {/* Reset Notice */}
          <div className="text-xs text-muted-foreground/70 italic pt-2 border-t border-border/30">
            Resets every Monday at 00:00
          </div>
        </div>
      </Card>
    </WidgetWrapper>
  );
};
