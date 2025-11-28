import { PremiumCard } from '@/components/ui/PremiumCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface ForecastChartProps {
  currentBalance: number;
  dailyGrowthBase: number;
  dailyGrowthOptimistic: number;
  dailyGrowthConservative: number;
  selectedPeriod: number; // days
}

export const ForecastChart = ({
  currentBalance,
  dailyGrowthBase,
  dailyGrowthOptimistic,
  dailyGrowthConservative,
  selectedPeriod
}: ForecastChartProps) => {
  // Generate chart data
  const generateChartData = () => {
    const data = [];
    const points = Math.min(selectedPeriod, 100); // Max 100 points for performance
    const interval = Math.ceil(selectedPeriod / points);

    for (let day = 0; day <= selectedPeriod; day += interval) {
      // Growth rates are now decimals (e.g., 0.0117 for 1.17% growth)
      const conservative = currentBalance * Math.pow(1 + dailyGrowthConservative, day);
      const base = currentBalance * Math.pow(1 + dailyGrowthBase, day);
      const optimistic = currentBalance * Math.pow(1 + dailyGrowthOptimistic, day);

      data.push({
        day,
        conservative: conservative.toFixed(2),
        base: base.toFixed(2),
        optimistic: optimistic.toFixed(2),
      });
    }

    return data;
  };

  const chartData = generateChartData();

  const formatXAxis = (value: number) => {
    if (selectedPeriod <= 30) return `Day ${value}`;
    if (selectedPeriod <= 365) return `${Math.round(value / 30)}mo`;
    return `${Math.round(value / 365)}yr`;
  };

  const formatTooltip = (value: any) => {
    return `$${parseFloat(value).toLocaleString()}`;
  };

  return (
    <PremiumCard title="Growth Projection" className="bg-card border-border">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorConservative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--neon-red))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--neon-red))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--neon-purple))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--neon-purple))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--neon-green))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--neon-green))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-white/5" opacity={0.3} />
          <XAxis
            dataKey="day"
            tickFormatter={formatXAxis}
            stroke="hsl(var(--border))"
            style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            stroke="hsl(var(--border))"
            style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              backdropFilter: 'blur(12px)'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
          />
          <Area
            type="monotone"
            dataKey="conservative"
            stroke="hsl(var(--neon-red))"
            strokeWidth={2}
            fill="url(#colorConservative)"
            name="Conservative"
          />
          <Area
            type="monotone"
            dataKey="base"
            stroke="hsl(var(--neon-purple))"
            strokeWidth={2}
            fill="url(#colorBase)"
            name="Base Case"
          />
          <Area
            type="monotone"
            dataKey="optimistic"
            stroke="hsl(var(--neon-green))"
            strokeWidth={2}
            fill="url(#colorOptimistic)"
            name="Optimistic"
          />
        </AreaChart>
      </ResponsiveContainer>
    </PremiumCard>
  );
};
