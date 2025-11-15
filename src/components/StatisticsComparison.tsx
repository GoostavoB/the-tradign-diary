import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Trade } from '@/types/trade';
import { calculateTradePnL, calculateTotalPnL } from '@/utils/pnl';

interface StatisticsComparisonProps {
  trades: Trade[];
}

export const StatisticsComparison = ({ trades }: StatisticsComparisonProps) => {
  if (trades.length === 0) return null;

  // Get current month and previous month trades
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthTrades = trades.filter(t => {
    const tradeDate = new Date(t.trade_date);
    return tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear;
  });

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const lastMonthTrades = trades.filter(t => {
    const tradeDate = new Date(t.trade_date);
    return tradeDate.getMonth() === lastMonth && tradeDate.getFullYear() === lastMonthYear;
  });

  if (currentMonthTrades.length === 0 && lastMonthTrades.length === 0) {
    return null;
  }

  // Calculate metrics
  const calculateMetrics = (tradesToAnalyze: Trade[]) => {
    if (tradesToAnalyze.length === 0) return null;
    
    const totalPnl = calculateTotalPnL(tradesToAnalyze, { includeFees: true });
    const wins = tradesToAnalyze.filter(t => calculateTradePnL(t, { includeFees: true }) > 0).length;
    const winRate = (wins / tradesToAnalyze.length) * 100;
    const avgRoi = tradesToAnalyze.reduce((sum, t) => sum + (t.roi || 0), 0) / tradesToAnalyze.length;
    
    return {
      trades: tradesToAnalyze.length,
      pnl: totalPnl,
      winRate,
      avgRoi,
    };
  };

  const currentMetrics = calculateMetrics(currentMonthTrades);
  const lastMetrics = calculateMetrics(lastMonthTrades);

  const getComparison = (current: number, previous: number | null): { change: number; direction: 'up' | 'down' | 'neutral' } => {
    if (previous === null) return { change: 0, direction: 'neutral' };
    const change = ((current - previous) / Math.abs(previous)) * 100;
    if (change > 0) return { change: Math.abs(change), direction: 'up' };
    if (change < 0) return { change: Math.abs(change), direction: 'down' };
    return { change: 0, direction: 'neutral' };
  };

  const ComparisonBadge = ({ change, direction }: { change: number; direction: 'up' | 'down' | 'neutral' }) => {
    if (direction === 'neutral') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Minus className="w-3 h-3" />
          No change
        </Badge>
      );
    }
    
    const isPositive = direction === 'up';
    return (
      <Badge 
        variant="secondary" 
        className={`gap-1 ${isPositive ? 'text-neon-green' : 'text-neon-red'}`}
      >
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change.toFixed(1)}%
      </Badge>
    );
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Month-over-Month Comparison</h3>
        <p className="text-sm text-muted-foreground">
          {monthNames[currentMonth]} vs {monthNames[lastMonth]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trades */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Trades</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{currentMetrics?.trades || 0}</p>
              {lastMetrics && (
                <p className="text-xs text-muted-foreground">
                  Previous: {lastMetrics.trades}
                </p>
              )}
            </div>
            {lastMetrics && (
              <ComparisonBadge 
                {...getComparison(currentMetrics?.trades || 0, lastMetrics.trades)} 
              />
            )}
          </div>
        </div>

        {/* Total P&L */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total P&L</p>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${
                (currentMetrics?.pnl || 0) > 0 ? 'text-neon-green' : 
                (currentMetrics?.pnl || 0) < 0 ? 'text-neon-red' : 
                'text-foreground'
              }`}>
                ${(currentMetrics?.pnl || 0).toFixed(2)}
              </p>
              {lastMetrics && (
                <p className="text-xs text-muted-foreground">
                  Previous: ${lastMetrics.pnl.toFixed(2)}
                </p>
              )}
            </div>
            {lastMetrics && (
              <ComparisonBadge 
                {...getComparison(currentMetrics?.pnl || 0, lastMetrics.pnl)} 
              />
            )}
          </div>
        </div>

        {/* Win Rate */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {(currentMetrics?.winRate || 0).toFixed(1)}%
              </p>
              {lastMetrics && (
                <p className="text-xs text-muted-foreground">
                  Previous: {lastMetrics.winRate.toFixed(1)}%
                </p>
              )}
            </div>
            {lastMetrics && (
              <ComparisonBadge 
                {...getComparison(currentMetrics?.winRate || 0, lastMetrics.winRate)} 
              />
            )}
          </div>
        </div>

        {/* Avg ROI */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Avg ROI</p>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-2xl font-bold ${
                (currentMetrics?.avgRoi || 0) > 0 ? 'text-neon-green' : 
                (currentMetrics?.avgRoi || 0) < 0 ? 'text-neon-red' : 
                'text-foreground'
              }`}>
                {(currentMetrics?.avgRoi || 0).toFixed(2)}%
              </p>
              {lastMetrics && (
                <p className="text-xs text-muted-foreground">
                  Previous: {lastMetrics.avgRoi.toFixed(2)}%
                </p>
              )}
            </div>
            {lastMetrics && (
              <ComparisonBadge 
                {...getComparison(currentMetrics?.avgRoi || 0, lastMetrics.avgRoi)} 
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
