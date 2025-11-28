import { useState } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trade } from '@/types/trade';
import { runMonteCarloSimulation, MonteCarloParams } from '@/utils/monteCarloSimulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PlayCircle, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MonteCarloSimulatorProps {
  trades: Trade[];
}

export const MonteCarloSimulator = ({ trades }: MonteCarloSimulatorProps) => {
  const [params, setParams] = useState<MonteCarloParams>({
    initialCapital: 10000,
    tradeDays: 30,
    tradesPerDay: 3,
    simulations: 100,
  });
  const [result, setResult] = useState<ReturnType<typeof runMonteCarloSimulation> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunSimulation = () => {
    if (trades.length < 10) {
      alert('Need at least 10 historical trades to run simulation');
      return;
    }

    setIsRunning(true);
    try {
      const simResult = runMonteCarloSimulation(trades, params);
      setResult(simResult);
    } catch (error) {
      alert('Error running simulation: ' + (error as Error).message);
    }
    setIsRunning(false);
  };

  const chartData = result ?
    result.simulations[0].values.map((_, idx) => {
      const values = result.simulations.map(s => s.values[idx]);
      return {
        day: idx,
        median: values.sort((a, b) => a - b)[Math.floor(values.length / 2)],
        p25: values.sort((a, b) => a - b)[Math.floor(values.length * 0.25)],
        p75: values.sort((a, b) => a - b)[Math.floor(values.length * 0.75)],
      };
    }) : [];

  return (
    <div className="space-y-6">
      <PremiumCard className="p-6">
        <h3 className="text-xl font-semibold mb-4">Simulation Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Initial Capital ($)</label>
            <Input
              type="number"
              value={params.initialCapital}
              onChange={(e) => setParams({ ...params, initialCapital: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Trading Days</label>
            <Input
              type="number"
              value={params.tradeDays}
              onChange={(e) => setParams({ ...params, tradeDays: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Trades Per Day</label>
            <Input
              type="number"
              value={params.tradesPerDay}
              onChange={(e) => setParams({ ...params, tradesPerDay: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Number of Simulations</label>
            <Input
              type="number"
              value={params.simulations}
              onChange={(e) => setParams({ ...params, simulations: parseInt(e.target.value) })}
              min={10}
              max={1000}
            />
          </div>
        </div>

        <Button
          onClick={handleRunSimulation}
          disabled={isRunning || trades.length < 10}
          className="w-full gap-2"
        >
          <PlayCircle className="h-4 w-4" />
          {isRunning ? 'Running Simulation...' : 'Run Monte Carlo Simulation'}
        </Button>

        {trades.length < 10 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Need at least 10 trades to run simulation
          </p>
        )}
      </PremiumCard>

      {result && (
        <>
          <PremiumCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Projection Range</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Portfolio Value ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <ReferenceLine y={params.initialCapital} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="p75" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="75th Percentile" />
                  <Line type="monotone" dataKey="median" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} name="Median" />
                  <Line type="monotone" dataKey="p25" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="25th Percentile" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </PremiumCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PremiumCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Upside Potential
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Best Case Scenario</div>
                  <div className="text-2xl font-bold text-success">
                    ${result.statistics.bestCase.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    +{((result.statistics.bestCase / params.initialCapital - 1) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Median Outcome</div>
                  <div className="text-2xl font-bold">
                    ${result.statistics.medianFinalValue.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((result.statistics.medianFinalValue / params.initialCapital - 1) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Probability of Profit</div>
                  <Badge variant={result.statistics.probabilityOfProfit > 60 ? 'default' : 'secondary'}>
                    {result.statistics.probabilityOfProfit.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </PremiumCard>

            <PremiumCard className="p-6 border-destructive/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Risk Assessment
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Worst Case Scenario</div>
                  <div className="text-2xl font-bold text-destructive">
                    ${result.statistics.worstCase.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {((result.statistics.worstCase / params.initialCapital - 1) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Maximum Drawdown</div>
                  <div className="text-2xl font-bold text-destructive">
                    {result.statistics.maxDrawdown.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Risk of Ruin (50% loss)</div>
                  <Badge variant={result.statistics.probabilityOfRuin < 10 ? 'default' : 'destructive'}>
                    {result.statistics.probabilityOfRuin.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </PremiumCard>
          </div>

          <PremiumCard className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Value at Risk (VaR)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="text-sm text-muted-foreground mb-2">95% Confidence VaR</div>
                <div className="text-2xl font-bold text-destructive">
                  ${result.statistics.valueAtRisk95.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  95% chance losses won't exceed this amount
                </div>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="text-sm text-muted-foreground mb-2">99% Confidence VaR</div>
                <div className="text-2xl font-bold text-destructive">
                  ${result.statistics.valueAtRisk99.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  99% chance losses won't exceed this amount
                </div>
              </div>
            </div>
          </PremiumCard>
        </>
      )}
    </div>
  );
};
