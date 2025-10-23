import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, AlertCircle } from 'lucide-react';
import { ProfitLossHighlight } from '@/components/ProfitLossHighlight';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
}

const StatCard = ({ title, value, change, icon: Icon, trend }: StatCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <ProfitLossHighlight value={change} showIcon />
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          trend === 'up' ? "bg-success/10" : trend === 'down' ? "bg-destructive/10" : "bg-primary/10"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            trend === 'up' ? "text-success" : trend === 'down' ? "text-destructive" : "text-primary"
          )} />
        </div>
      </div>
    </Card>
  );
};

export const StatsOverview = () => {
  const { t } = useTranslation();

  // Mock data - in real app, this would come from API/state
  const stats = [
    {
      title: t('dashboard.totalPnL'),
      value: '$12,450.32',
      change: 15.3,
      icon: DollarSign,
      trend: 'up' as const
    },
    {
      title: t('dashboard.winRate'),
      value: '68.5%',
      change: 5.2,
      icon: Target,
      trend: 'up' as const
    },
    {
      title: t('dashboard.totalTrades'),
      value: '247',
      icon: Activity
    },
    {
      title: t('dashboard.avgProfit'),
      value: '$183.42',
      change: -2.1,
      icon: TrendingUp,
      trend: 'down' as const
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
