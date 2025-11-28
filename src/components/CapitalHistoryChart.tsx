import { PremiumCard } from '@/components/ui/PremiumCard';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { formatCapitalLogForChart } from '@/utils/capitalCalculations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CapitalLogEntry {
  id: string;
  log_date: string;
  amount_added: number;
  total_after: number;
  notes?: string;
}

export const CapitalHistoryChart = () => {
  const { data: capitalLog = [], isLoading } = useQuery({
    queryKey: ['capital-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capital_log')
        .select('*')
        .order('log_date', { ascending: true });

      if (error) throw error;
      return data as CapitalLogEntry[];
    },
  });

  const chartData = formatCapitalLogForChart(capitalLog);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-strong p-3 rounded-lg border border-border/50">
          <p className="font-semibold">{data.date}</p>
          <p className="text-accent">Capital: ${data.capital.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Added: +${data.added.toLocaleString()}</p>
          {data.notes && (
            <p className="text-xs text-muted-foreground mt-1 italic">"{data.notes}"</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <PremiumCard className="p-6 glass-strong">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading capital history...</p>
        </div>
      </PremiumCard>
    );
  }

  if (chartData.length === 0) {
    return (
      <PremiumCard className="p-6 glass-strong">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Info className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            No capital history yet. Add your first capital entry to see the evolution chart.
          </p>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="p-6 glass-strong">
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          Capital Evolution Over Time
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Track how your trading capital has grown through additions and deposits
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="capital"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            fill="url(#capitalGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <Info className="h-4 w-4 text-accent" />
          Each point represents a capital addition. Hover over points to see details and notes.
        </p>
      </div>
    </PremiumCard>
  );
};
