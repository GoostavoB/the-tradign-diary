import { Card } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp } from 'lucide-react';

interface PerformanceChartProps {
  data?: Array<{ date: string; value: number; }>;
  type?: 'line' | 'area';
  title?: string;
}

export const PerformanceChart = ({ 
  data, 
  type = 'area',
  title 
}: PerformanceChartProps) => {
  const { t } = useTranslation();

  // Mock data if none provided
  const chartData = data || [
    { date: 'Jan', value: 4000 },
    { date: 'Feb', value: 5200 },
    { date: 'Mar', value: 4800 },
    { date: 'Apr', value: 6100 },
    { date: 'May', value: 7300 },
    { date: 'Jun', value: 8500 },
    { date: 'Jul', value: 9200 },
    { date: 'Aug', value: 10100 },
    { date: 'Sep', value: 9800 },
    { date: 'Oct', value: 11200 },
    { date: 'Nov', value: 12400 },
    { date: 'Dec', value: 14200 }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">
          {title || t('charts.performance')}
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {type === 'area' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
};
