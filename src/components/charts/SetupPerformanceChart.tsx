import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, ReferenceLine, Cell } from 'recharts';
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";

interface SetupPerformanceChartProps {
  data: Array<{
    setup: string;
    winRate: number;
    roi: number;
    tradeCount: number;
  }>;
}

export const SetupPerformanceChart = ({ data }: SetupPerformanceChartProps) => {
  const getQuadrantLabel = (entry: any) => {
    if (entry.winRate > 50 && entry.roi > 0) return 'Best Performance - High WR & Positive ROI';
    if (entry.winRate <= 50 && entry.roi > 0) return 'Profitable - But Low Win Rate';
    if (entry.winRate > 50 && entry.roi <= 0) return 'Losing Despite High WR';
    return 'Avoid - Low WR & Negative ROI';
  };

  const getBubbleColor = (entry: any) => {
    if (entry.winRate > 50 && entry.roi > 0) return 'hsl(var(--neon-green))';
    if (entry.winRate <= 50 && entry.roi < 0) return 'hsl(var(--neon-red))';
    return 'hsl(var(--neon-yellow))';
  };

  const quadrants = [
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      label: "Best Performers",
      description: "High Win Rate + Positive ROI",
      color: "text-success",
      position: "top-right"
    },
    {
      icon: <AlertCircle className="h-5 w-5" />,
      label: "Needs Work",
      description: "Low Win Rate + Negative ROI",
      color: "text-warning",
      position: "top-left"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Refine Entry",
      description: "Low Win Rate + Positive ROI",
      color: "text-warning",
      position: "bottom-right"
    },
    {
      icon: <TrendingDown className="h-5 w-5" />,
      label: "Avoid These",
      description: "Low Win Rate + Negative ROI",
      color: "text-destructive",
      position: "bottom-left"
    },
  ];

  return (
    <PremiumCard className="p-8">
      {/* Header Section */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold gradient-text">Your Custom Setups Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Performance breakdown of your custom-tagged trading strategies
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {data.length} Setup{data.length !== 1 ? 's' : ''} Tracked
          </Badge>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart
            margin={{ top: 70, right: 70, bottom: 70, left: 70 }}
          >
            <defs>
              <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--neon-green))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--neon-green))" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--neon-yellow))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--neon-yellow))" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-white/5"
              vertical={false}
            />

            {/* Quadrant divider lines */}
            <ReferenceLine
              x={50}
              stroke="hsl(var(--border))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: '50% Win Rate', position: 'top', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />
            <ReferenceLine
              y={0}
              stroke="hsl(var(--border))"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: 'Break Even', position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            />

            <XAxis
              type="number"
              dataKey="winRate"
              name="Win Rate"
              unit="%"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              label={{
                value: 'Win Rate (%)',
                position: 'insideBottom',
                offset: -20,
                fill: 'hsl(var(--muted-foreground))',
                style: { fontWeight: 600, fontSize: 12 }
              }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              type="number"
              dataKey="roi"
              name="ROI"
              unit="%"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              label={{
                value: 'ROI (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                fill: 'hsl(var(--muted-foreground))',
                style: { fontWeight: 600, fontSize: 12 }
              }}
              stroke="hsl(var(--border))"
            />
            <ZAxis
              type="number"
              dataKey="tradeCount"
              range={[200, 1200]}
              name="Trade Count"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="glass-strong p-4 rounded-xl border shadow-xl backdrop-blur-xl">
                    <p className="font-bold text-lg mb-3 gradient-text">{data.setup}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className="font-mono font-bold">{data.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className={`font-mono font-bold ${data.roi > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {data.roi > 0 ? '+' : ''}{data.roi.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-muted-foreground">Total Trades:</span>
                        <span className="font-mono font-semibold">{data.tradeCount}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {getQuadrantLabel(data)}
                      </p>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill="hsl(var(--primary))">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBubbleColor(entry)}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Quadrant Legend */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Quadrant Guide
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quadrants.map((quadrant, index) => (
            <div
              key={index}
              className="glass p-4 rounded-lg hover-lift transition-all"
            >
              <div className={`flex items-center gap-2 mb-2 ${quadrant.color}`}>
                {quadrant.icon}
                <p className="font-semibold text-sm">{quadrant.label}</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {quadrant.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 glass-subtle p-4 rounded-lg">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">How to read:</span> Each bubble represents one of your custom trading setups.
          Bubble size indicates the number of trades executed with that setup.
          The best setups appear in the top-right quadrant (high win rate + positive ROI).
        </p>
      </div>
    </PremiumCard>
  );
};
