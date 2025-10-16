import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, DollarSign } from 'lucide-react';

interface Trade {
  id: string;
  asset: string;
  pnl: number;
  roi: number;
  setup: string;
  trade_date: string;
}

interface AdvancedAnalyticsProps {
  trades: Trade[];
  initialInvestment: number;
}

export const AdvancedAnalytics = ({ trades, initialInvestment }: AdvancedAnalyticsProps) => {
  // Total ROI calculation
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalROI = initialInvestment > 0 ? ((totalPnl / initialInvestment) * 100) : 0;

  // Average ROI per trade
  const avgROI = trades.length > 0 
    ? trades.reduce((sum, t) => sum + (t.roi || 0), 0) / trades.length 
    : 0;

  // Average revenue per day
  const tradesByDate = trades.reduce((acc, trade) => {
    const date = new Date(trade.trade_date).toDateString();
    if (!acc[date]) acc[date] = 0;
    acc[date] += trade.pnl || 0;
    return acc;
  }, {} as Record<string, number>);
  const avgRevenuePerDay = Object.keys(tradesByDate).length > 0
    ? Object.values(tradesByDate).reduce((sum, pnl) => sum + pnl, 0) / Object.keys(tradesByDate).length
    : 0;

  // Most traded asset
  const assetCounts = trades.reduce((acc, trade) => {
    acc[trade.asset] = (acc[trade.asset] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostTradedAsset = Object.entries(assetCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Asset with biggest losses
  const assetLosses = trades.reduce((acc, trade) => {
    if (!acc[trade.asset]) acc[trade.asset] = 0;
    acc[trade.asset] += trade.pnl || 0;
    return acc;
  }, {} as Record<string, number>);
  const assetWithBiggestLosses = Object.entries(assetLosses)
    .sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';

  // Asset with more wins
  const assetWins = trades.reduce((acc, trade) => {
    if (trade.pnl > 0) {
      if (!acc[trade.asset]) acc[trade.asset] = 0;
      acc[trade.asset] += 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const assetWithMoreWins = Object.entries(assetWins)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Top setup by wins
  const setupWins = trades.reduce((acc, trade) => {
    if (trade.pnl > 0 && trade.setup) {
      if (!acc[trade.setup]) acc[trade.setup] = 0;
      acc[trade.setup] += 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topSetupByWins = Object.entries(setupWins)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Top setup by ROI
  const setupROI = trades.reduce((acc, trade) => {
    if (trade.setup) {
      if (!acc[trade.setup]) {
        acc[trade.setup] = { total: 0, count: 0 };
      }
      acc[trade.setup].total += trade.roi || 0;
      acc[trade.setup].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
  const topSetupByROI = Object.entries(setupROI)
    .map(([setup, data]) => ({ setup, avgROI: data.total / data.count }))
    .sort((a, b) => b.avgROI - a.avgROI)[0]?.setup || 'N/A';

  const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
    <Card className="p-6 bg-card border-border hover:border-foreground/20 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon 
          className={trend === 'up' ? 'text-neon-green' : trend === 'down' ? 'text-neon-red' : 'text-foreground'} 
          size={24} 
        />
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Total ROI"
            value={`${totalROI.toFixed(2)}%`}
            subtitle={`Based on initial investment of $${initialInvestment.toFixed(2)}`}
            icon={Target}
            trend={totalROI > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Average ROI per Trade"
            value={`${avgROI.toFixed(2)}%`}
            icon={TrendingUp}
            trend="neutral"
          />
          <StatCard
            title="Avg Revenue per Day"
            value={`$${avgRevenuePerDay.toFixed(2)}`}
            icon={DollarSign}
            trend={avgRevenuePerDay > 0 ? 'up' : 'down'}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Asset Performance</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Most Traded</p>
                <p className="font-medium">{mostTradedAsset}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Most Wins</p>
                <p className="font-medium text-neon-green">{assetWithMoreWins}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Biggest Losses</p>
                <p className="font-medium text-neon-red">{assetWithBiggestLosses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4">Setup Performance</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Top Setup by Wins</p>
                <p className="font-medium">{topSetupByWins}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Setup by ROI</p>
                <p className="font-medium">{topSetupByROI}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};