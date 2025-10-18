import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from "@/components/ui/card";

interface TimeDistributionChartProps {
  data: Array<{
    hour: number;
    wins: number;
    losses: number;
    winRate: number;
  }>;
}

export const TimeDistributionChart = ({ data }: TimeDistributionChartProps) => {
  const getColor = (winRate: number) => {
    if (winRate >= 70) return 'hsl(142, 76%, 36%)'; // green
    if (winRate >= 50) return 'hsl(47, 96%, 53%)'; // yellow
    return 'hsl(0, 84%, 60%)'; // red
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Win/Loss by Hour of Day</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="hour" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
            label={{ value: 'Hour (24h format)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--foreground))' }}
            label={{ value: 'Number of Trades', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value, name) => {
              if (name === 'winRate') return [`${value}%`, 'Win Rate'];
              return [value, name === 'wins' ? 'Wins' : 'Losses'];
            }}
          />
          <Legend />
          <Bar dataKey="wins" fill="hsl(var(--primary))" name="Wins" />
          <Bar dataKey="losses" fill="hsl(var(--destructive))" name="Losses" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-8 gap-1">
        {data.map((item) => (
          <div
            key={item.hour}
            className="aspect-square rounded"
            style={{ backgroundColor: getColor(item.winRate) }}
            title={`${item.hour}:00 - ${item.winRate}% win rate`}
          />
        ))}
      </div>
    </Card>
  );
};
