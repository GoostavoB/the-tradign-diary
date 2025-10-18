import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts';
import { Card } from "@/components/ui/card";

interface SetupPerformanceChartProps {
  data: Array<{
    setup: string;
    winRate: number;
    roi: number;
    tradeCount: number;
  }>;
}

export const SetupPerformanceChart = ({ data }: SetupPerformanceChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Setup Performance (Bubble Chart)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            type="number" 
            dataKey="winRate" 
            name="Win Rate"
            unit="%"
            domain={[0, 100]}
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
            label={{ value: 'Win Rate (%)', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="roi" 
            name="ROI"
            unit="%"
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
            label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis 
            type="number" 
            dataKey="tradeCount" 
            range={[100, 1000]} 
            name="Trade Count"
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: any, name: string) => {
              if (name === 'Win Rate') return [`${value}%`, name];
              if (name === 'ROI') return [`${value}%`, name];
              return [value, name];
            }}
          />
          <Legend />
          <Scatter 
            name="Setups" 
            data={data} 
            fill="hsl(var(--primary))"
          >
            {data.map((entry, index) => (
              <text
                key={`label-${index}`}
                x={entry.winRate}
                y={entry.roi}
                dy={-10}
                textAnchor="middle"
                fill="hsl(var(--foreground))"
                fontSize={10}
              >
                {entry.setup}
              </text>
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Bubble size represents trade count. Top-right quadrant shows best setups.
      </p>
    </Card>
  );
};
