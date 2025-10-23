import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlayCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { Trade } from '@/types/trade';
import { runBacktest, BacktestStrategy, BacktestResult, getBacktestPeriods } from '@/utils/backtesting';

interface BacktestingSystemProps {
  trades: Trade[];
}

const predefinedStrategies: BacktestStrategy[] = [
  {
    name: 'Morning Scalper',
    entryCondition: (trade) => trade.period_of_day === 'morning',
    exitCondition: (trade) => (trade.duration_hours || 0) < 4,
    riskPerTrade: 2,
    maxPositions: 3,
  },
  {
    name: 'Trend Follower',
    entryCondition: (trade) => (trade.leverage || 1) <= 3,
    exitCondition: (trade) => (trade.duration_hours || 0) > 24,
    riskPerTrade: 3,
    maxPositions: 2,
  },
  {
    name: 'High Conviction',
    entryCondition: (trade) => (trade.leverage || 1) > 5,
    exitCondition: () => true,
    riskPerTrade: 5,
    maxPositions: 1,
  },
];

export const BacktestingSystem = ({ trades }: BacktestingSystemProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all-time');
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const periods = getBacktestPeriods();

  const handleRunBacktest = () => {
    setIsRunning(true);
    
    const period = periods.find(p => p.label.toLowerCase().replace(/\s/g, '-') === selectedPeriod);
    const backtestResults = predefinedStrategies.map(strategy => 
      runBacktest(trades, strategy, period)
    );
    
    setResults(backtestResults);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Backtesting Configuration</h3>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Time Period</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map(period => (
                  <SelectItem 
                    key={period.label} 
                    value={period.label.toLowerCase().replace(/\s/g, '-')}
                  >
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleRunBacktest} 
            disabled={isRunning || trades.length === 0}
            className="gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Run Backtest
          </Button>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>Testing {predefinedStrategies.length} strategies across {trades.length} historical trades</p>
        </div>
      </Card>

      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Backtest Results</h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Strategy</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                  <TableHead className="text-right">Total P&L</TableHead>
                  <TableHead className="text-right">Profit Factor</TableHead>
                  <TableHead className="text-right">Sharpe</TableHead>
                  <TableHead className="text-right">Max DD</TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{result.strategyName}</TableCell>
                    <TableCell className="text-right">{result.totalTrades}</TableCell>
                    <TableCell className="text-right">
                      <span className={result.winRate >= 50 ? 'text-success' : 'text-destructive'}>
                        {result.winRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {result.totalPnL >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                        <span className={result.totalPnL >= 0 ? 'text-success' : 'text-destructive'}>
                          ${result.totalPnL.toFixed(2)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{result.profitFactor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{result.sharpeRatio.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-destructive">
                      ${result.maxDrawdown.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={result.roi >= 0 ? 'text-success' : 'text-destructive'}>
                        {result.roi.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
};
