import { memo } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/utils/formatNumber';
import { TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle, DollarSign } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { BlurredCurrency } from '@/components/ui/BlurredValue';
import { useCapitalGrowthData } from '@/hooks/useCapitalGrowthData';

interface CapitalGrowthWidgetProps {
  id: string;
  isEditMode?: boolean;
  onRemove?: () => void;
}

export const CapitalGrowthWidget = memo(({
  id,
  isEditMode,
  onRemove,
}: CapitalGrowthWidgetProps) => {
  const { t } = useTranslation();
  const {
    chartData,
    initialInvestment,
    totalDeposits,
    totalWithdrawals,
    tradingPnL,
    currentBalance,
    growthPercent,
    isLoading,
  } = useCapitalGrowthData();

  const isPositive = growthPercent >= 0;

  return (
    <WidgetWrapper
      id={id}
      title={t('widgets.capitalGrowth.title')}
      isEditMode={isEditMode}
      onRemove={onRemove}
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Initial</p>
            </div>
            <p className="text-sm font-semibold">
              <BlurredCurrency amount={initialInvestment} className="inline" />
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <ArrowUpCircle className="h-3 w-3 text-blue-500" />
              <p className="text-xs text-muted-foreground">Deposits</p>
            </div>
            <p className="text-sm font-semibold text-blue-500">
              <BlurredCurrency amount={totalDeposits} className="inline" />
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <ArrowDownCircle className="h-3 w-3 text-orange-500" />
              <p className="text-xs text-muted-foreground">Withdrawals</p>
            </div>
            <p className="text-sm font-semibold text-orange-500">
              <BlurredCurrency amount={totalWithdrawals} className="inline" />
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {tradingPnL >= 0 ? (
                <TrendingUp className="h-3 w-3 text-profit" />
              ) : (
                <TrendingDown className="h-3 w-3 text-loss" />
              )}
              <p className="text-xs text-muted-foreground">Trading P&L</p>
            </div>
            <p className={`text-sm font-semibold ${tradingPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {tradingPnL >= 0 ? '+' : ''}<BlurredCurrency amount={tradingPnL} className="inline" />
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Balance</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold">
                <BlurredCurrency amount={currentBalance} className="inline" />
              </p>
              <span className={`text-xs ${isPositive ? 'text-profit' : 'text-loss'}`}>
                ({isPositive ? '+' : ''}{growthPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor="hsl(var(--primary))" 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor="hsl(var(--primary))" 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatCurrency(value), t('widgets.balance')]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#capitalGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetWrapper>
  );
});

CapitalGrowthWidget.displayName = 'CapitalGrowthWidget';
