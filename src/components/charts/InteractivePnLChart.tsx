import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { Card } from "@/components/ui/card";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";

interface InteractivePnLChartProps {
  data: Array<{
    date: string;
    pnl: number;
    cumulative: number;
  }>;
}

const InteractivePnLChartComponent = ({ data }: InteractivePnLChartProps) => {
  const { isMobile } = useMobileOptimization();
  
  const averagePnL = useMemo(() => 
    data.reduce((sum, item) => sum + item.pnl, 0) / data.length,
    [data]
  );

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Interactive P&L Chart</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: isMobile ? 9 : 11 }}
            interval={isMobile ? 'preserveStartEnd' : 'preserveEnd'}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: isMobile ? 9 : 11 }}
            width={isMobile ? 35 : 45}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: isMobile ? '11px' : '13px',
              padding: isMobile ? '6px 10px' : '8px 12px'
            }}
          />
          <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '13px' }} />
          <ReferenceLine 
            y={averagePnL} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="3 3" 
            label="Average"
          />
          <Line 
            type="monotone" 
            dataKey="cumulative" 
            stroke="hsl(var(--primary))" 
            strokeWidth={isMobile ? 1.5 : 2}
            name="Cumulative P&L"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="pnl" 
            stroke="hsl(var(--secondary))" 
            strokeWidth={isMobile ? 1 : 1.5}
            name="Daily P&L"
            dot={false}
          />
          {!isMobile && (
            <Brush 
              dataKey="date" 
              height={30} 
              stroke="hsl(var(--primary))"
              fill="hsl(var(--muted))"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export const InteractivePnLChart = memo(InteractivePnLChartComponent);
