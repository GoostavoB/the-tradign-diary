import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign, Percent } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdvancedMetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  data: Array<{ date: string; value: number }>;
  type?: 'line' | 'area';
  icon?: 'trending' | 'activity' | 'dollar' | 'percent';
}

const iconMap = {
  trending: TrendingUp,
  activity: Activity,
  dollar: DollarSign,
  percent: Percent,
};

export function AdvancedMetricsCard({ 
  title, 
  value, 
  change, 
  data, 
  type = 'line',
  icon = 'trending' 
}: AdvancedMetricsCardProps) {
  const isPositive = change >= 0;
  const Icon = iconMap[icon];
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            <TrendIcon className="h-4 w-4" />
            <span>{Math.abs(change).toFixed(2)}%</span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        </div>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="h-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorValue)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
