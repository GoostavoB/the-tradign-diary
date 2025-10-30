import { Card } from '@/components/ui/card';
import { Target, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { PinButton } from '../PinButton';
import { usePinnedWidgets } from '@/contexts/PinnedWidgetsContext';
import { BlurredCurrency } from '@/components/ui/BlurredValue';

interface StatsWidgetProps {
  winRate?: number;
  winCount?: number;
  lossCount?: number;
  totalProfit?: number;
  currentROI?: number;
  totalTrades?: number;
}

export function WinRateWidget({ winRate = 0, winCount = 0, lossCount = 0 }: StatsWidgetProps) {
  const { isPinned, togglePin } = usePinnedWidgets();
  const widgetId = 'win-rate';

  return (
    <Card className="relative p-4 hover:shadow-lg transition-all">
      <div className="absolute top-2 right-2">
        <PinButton isPinned={isPinned(widgetId)} onToggle={() => togglePin(widgetId)} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Win Rate</span>
        </div>

        <p className="text-2xl font-bold">
          {winRate.toFixed(1)}%
        </p>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="text-success">Wins: {winCount}</span>
          <span className="text-destructive">Losses: {lossCount}</span>
        </div>
      </div>
    </Card>
  );
}

export function TotalProfitWidget({ totalProfit = 0 }: StatsWidgetProps) {
  const { isPinned, togglePin } = usePinnedWidgets();
  const widgetId = 'total-profit';
  const isPositive = totalProfit >= 0;

  return (
    <Card className="relative p-4 hover:shadow-lg transition-all">
      <div className="absolute top-2 right-2">
        <PinButton isPinned={isPinned(widgetId)} onToggle={() => togglePin(widgetId)} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Total Trading Profit</span>
        </div>

        <div className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
          <BlurredCurrency amount={totalProfit} />
        </div>

        <p className="text-xs text-muted-foreground">
          {isPositive ? 'Net profitable' : 'Net loss'}
        </p>
      </div>
    </Card>
  );
}

export function CurrentROIWidget({ currentROI = 0 }: StatsWidgetProps) {
  const { isPinned, togglePin } = usePinnedWidgets();
  const widgetId = 'current-roi';
  const isPositive = currentROI >= 0;

  return (
    <Card className="relative p-4 hover:shadow-lg transition-all">
      <div className="absolute top-2 right-2">
        <PinButton isPinned={isPinned(widgetId)} onToggle={() => togglePin(widgetId)} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Current ROI</span>
        </div>

        <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? '+' : ''}{currentROI.toFixed(2)}%
        </p>

        <p className="text-xs text-muted-foreground">
          Return on investment
        </p>
      </div>
    </Card>
  );
}

export function TotalTradesWidget({ totalTrades = 0 }: StatsWidgetProps) {
  const { isPinned, togglePin } = usePinnedWidgets();
  const widgetId = 'total-trades';

  return (
    <Card className="relative p-4 hover:shadow-lg transition-all">
      <div className="absolute top-2 right-2">
        <PinButton isPinned={isPinned(widgetId)} onToggle={() => togglePin(widgetId)} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Total Trades</span>
        </div>

        <p className="text-2xl font-bold">
          {totalTrades.toLocaleString()}
        </p>

        <p className="text-xs text-muted-foreground">
          All-time trades
        </p>
      </div>
    </Card>
  );
}
