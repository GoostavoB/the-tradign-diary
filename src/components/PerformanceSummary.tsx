import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Clock, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Trade {
  trade_date: string;
  pnl: number;
  roi: number;
}

interface PerformanceSummaryProps {
  trades: Trade[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_PERIODS = [
  { name: 'Morning', hours: [6, 7, 8, 9, 10, 11], icon: '🌅' },
  { name: 'Afternoon', hours: [12, 13, 14, 15, 16, 17], icon: '☀️' },
  { name: 'Evening', hours: [18, 19, 20, 21, 22, 23], icon: '🌆' },
  { name: 'Night', hours: [0, 1, 2, 3, 4, 5], icon: '🌙' },
];

export function PerformanceSummary({ trades }: PerformanceSummaryProps) {
  const insights = useMemo(() => {
    if (trades.length === 0) return null;

    // Analyze by day of week
    const dayStats: Record<number, { wins: number; total: number; pnl: number }> = {};
    const timeStats: Record<string, { wins: number; total: number; pnl: number }> = {};

    trades.forEach((trade) => {
      const date = new Date(trade.trade_date);
      const day = date.getDay();
      const hour = date.getHours();

      // Day stats
      if (!dayStats[day]) {
        dayStats[day] = { wins: 0, total: 0, pnl: 0 };
      }
      dayStats[day].total += 1;
      dayStats[day].pnl += trade.pnl || 0;
      if ((trade.pnl || 0) > 0) {
        dayStats[day].wins += 1;
      }

      // Time period stats
      const period = TIME_PERIODS.find(p => p.hours.includes(hour));
      if (period) {
        if (!timeStats[period.name]) {
          timeStats[period.name] = { wins: 0, total: 0, pnl: 0 };
        }
        timeStats[period.name].total += 1;
        timeStats[period.name].pnl += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) {
          timeStats[period.name].wins += 1;
        }
      }
    });

    // Find best day
    let bestDay = { day: 0, winRate: 0, trades: 0 };
    Object.entries(dayStats).forEach(([day, stats]) => {
      const winRate = stats.wins / stats.total;
      if (stats.total >= 3 && winRate > bestDay.winRate) {
        bestDay = { day: parseInt(day), winRate, trades: stats.total };
      }
    });

    // Find worst day
    let worstDay = { day: 0, winRate: 1, trades: 0 };
    Object.entries(dayStats).forEach(([day, stats]) => {
      const winRate = stats.wins / stats.total;
      if (stats.total >= 3 && winRate < worstDay.winRate) {
        worstDay = { day: parseInt(day), winRate, trades: stats.total };
      }
    });

    // Find best time period
    let bestTime = { period: '', winRate: 0, trades: 0, icon: '' };
    Object.entries(timeStats).forEach(([period, stats]) => {
      const winRate = stats.wins / stats.total;
      if (stats.total >= 3 && winRate > bestTime.winRate) {
        const periodData = TIME_PERIODS.find(p => p.name === period);
        bestTime = { period, winRate, trades: stats.total, icon: periodData?.icon || '' };
      }
    });

    // Find worst time period
    let worstTime = { period: '', winRate: 1, trades: 0, icon: '' };
    Object.entries(timeStats).forEach(([period, stats]) => {
      const winRate = stats.wins / stats.total;
      if (stats.total >= 3 && winRate < worstTime.winRate) {
        const periodData = TIME_PERIODS.find(p => p.name === period);
        worstTime = { period, winRate, trades: stats.total, icon: periodData?.icon || '' };
      }
    });

    return {
      bestDay: bestDay.trades > 0 ? bestDay : null,
      worstDay: worstDay.trades > 0 && worstDay.winRate < 1 ? worstDay : null,
      bestTime: bestTime.trades > 0 ? bestTime : null,
      worstTime: worstTime.trades > 0 && worstTime.winRate < 1 ? worstTime : null,
    };
  }, [trades]);

  if (!insights || (!insights.bestDay && !insights.bestTime)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          Not enough data yet.<br />
          Trade more to see insights!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neon-green" />
          Best Performance
        </h3>
        <div className="space-y-3">
          {insights.bestTime && (
            <Card className="p-3 bg-neon-green/5 border-neon-green/20">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Best Time</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <span>{insights.bestTime.icon}</span>
                    {insights.bestTime.period}
                  </p>
                  <p className="text-xs text-neon-green font-medium">
                    {(insights.bestTime.winRate * 100).toFixed(0)}% win rate • {insights.bestTime.trades} trades
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {insights.bestDay && (
            <Card className="p-3 bg-neon-green/5 border-neon-green/20">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-neon-green mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Best Day</p>
                  <p className="text-sm font-semibold text-foreground">
                    {DAYS[insights.bestDay.day]}
                  </p>
                  <p className="text-xs text-neon-green font-medium">
                    {(insights.bestDay.winRate * 100).toFixed(0)}% win rate • {insights.bestDay.trades} trades
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {(insights.worstTime || insights.worstDay) && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-neon-red" />
            Needs Improvement
          </h3>
          <div className="space-y-3">
            {insights.worstTime && (
              <Card className="p-3 bg-neon-red/5 border-neon-red/20">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-neon-red mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Avoid Trading</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <span>{insights.worstTime.icon}</span>
                      {insights.worstTime.period}
                    </p>
                    <p className="text-xs text-neon-red font-medium">
                      {(insights.worstTime.winRate * 100).toFixed(0)}% win rate • {insights.worstTime.trades} trades
                    </p>
                  </div>
                </div>
              </Card>
            )}
            
            {insights.worstDay && (
              <Card className="p-3 bg-neon-red/5 border-neon-red/20">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-neon-red mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Difficult Day</p>
                    <p className="text-sm font-semibold text-foreground">
                      {DAYS[insights.worstDay.day]}
                    </p>
                    <p className="text-xs text-neon-red font-medium">
                      {(insights.worstDay.winRate * 100).toFixed(0)}% win rate • {insights.worstDay.trades} trades
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}