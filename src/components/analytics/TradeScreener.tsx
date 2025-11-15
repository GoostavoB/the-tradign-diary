import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trade } from '@/types/trade';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Filter, X, Download } from 'lucide-react';
import { calculateTradePnL, calculateTotalPnL } from '@/utils/pnl';

interface TradeScreenerProps {
  trades: Trade[];
}

interface ScreenerFilters {
  symbol: string;
  side: string;
  broker: string;
  setup: string;
  minPnL: string;
  maxPnL: string;
  minRoi: string;
  maxRoi: string;
  dateFrom: string;
  dateTo: string;
}

export const TradeScreener = ({ trades }: TradeScreenerProps) => {
  const [filters, setFilters] = useState<ScreenerFilters>({
    symbol: '',
    side: 'all',
    broker: 'all',
    setup: 'all',
    minPnL: '',
    maxPnL: '',
    minRoi: '',
    maxRoi: '',
    dateFrom: '',
    dateTo: '',
  });

  const uniqueSymbols = useMemo(() => 
    Array.from(new Set(trades.map(t => t.symbol))).sort(),
    [trades]
  );

  const uniqueBrokers = useMemo(() => 
    Array.from(new Set(trades.map(t => t.broker).filter(Boolean))).sort(),
    [trades]
  );

  const uniqueSetups = useMemo(() => 
    Array.from(new Set(trades.map(t => t.setup).filter(Boolean))).sort(),
    [trades]
  );

  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false;
      }
      if (filters.side !== 'all' && trade.side !== filters.side) {
        return false;
      }
      if (filters.broker !== 'all' && trade.broker !== filters.broker) {
        return false;
      }
      if (filters.setup !== 'all' && trade.setup !== filters.setup) {
        return false;
      }
      if (filters.minPnL && (trade.profit_loss || 0) < parseFloat(filters.minPnL)) {
        return false;
      }
      if (filters.maxPnL && (trade.profit_loss || 0) > parseFloat(filters.maxPnL)) {
        return false;
      }
      if (filters.minRoi && (trade.roi || 0) < parseFloat(filters.minRoi)) {
        return false;
      }
      if (filters.maxRoi && (trade.roi || 0) > parseFloat(filters.maxRoi)) {
        return false;
      }
      if (filters.dateFrom && trade.opened_at && new Date(trade.opened_at) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && trade.opened_at && new Date(trade.opened_at) > new Date(filters.dateTo)) {
        return false;
      }
      return true;
    });
  }, [trades, filters]);

  const summary = useMemo(() => {
    const winningTrades = filteredTrades.filter(t => calculateTradePnL(t, { includeFees: true }) > 0);
    const totalPnL = calculateTotalPnL(filteredTrades, { includeFees: true });
    return {
      total: filteredTrades.length,
      winning: winningTrades.length,
      losing: filteredTrades.length - winningTrades.length,
      winRate: filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0,
      totalPnL,
    };
  }, [filteredTrades]);

  const clearFilters = () => {
    setFilters({
      symbol: '',
      side: 'all',
      broker: 'all',
      setup: 'all',
      minPnL: '',
      maxPnL: '',
      minRoi: '',
      maxRoi: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => 
    value && value !== 'all' && value !== ''
  ).length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Trade Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </h3>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Symbol</label>
            <Input
              placeholder="Search symbol..."
              value={filters.symbol}
              onChange={(e) => setFilters({ ...filters, symbol: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Side</label>
            <Select value={filters.side} onValueChange={(value) => setFilters({ ...filters, side: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sides</SelectItem>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Broker</label>
            <Select value={filters.broker} onValueChange={(value) => setFilters({ ...filters, broker: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brokers</SelectItem>
                {uniqueBrokers.map(broker => (
                  <SelectItem key={broker} value={broker!}>{broker}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Setup</label>
            <Select value={filters.setup} onValueChange={(value) => setFilters({ ...filters, setup: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Setups</SelectItem>
                {uniqueSetups.map(setup => (
                  <SelectItem key={setup} value={setup!}>{setup}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Min P&L ($)</label>
            <Input
              type="number"
              placeholder="Min..."
              value={filters.minPnL}
              onChange={(e) => setFilters({ ...filters, minPnL: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max P&L ($)</label>
            <Input
              type="number"
              placeholder="Max..."
              value={filters.maxPnL}
              onChange={(e) => setFilters({ ...filters, maxPnL: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Min ROI (%)</label>
            <Input
              type="number"
              placeholder="Min..."
              value={filters.minRoi}
              onChange={(e) => setFilters({ ...filters, minRoi: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max ROI (%)</label>
            <Input
              type="number"
              placeholder="Max..."
              value={filters.maxRoi}
              onChange={(e) => setFilters({ ...filters, maxRoi: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date To</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Results Summary</h3>
            <p className="text-sm text-muted-foreground">{summary.total} trades found</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-secondary/50">
            <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
            <div className="text-2xl font-bold">{summary.total}</div>
          </div>
          <div className="p-4 rounded-lg bg-success/10">
            <div className="text-sm text-muted-foreground mb-1">Winning</div>
            <div className="text-2xl font-bold text-success">{summary.winning}</div>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10">
            <div className="text-sm text-muted-foreground mb-1">Losing</div>
            <div className="text-2xl font-bold text-destructive">{summary.losing}</div>
          </div>
          <div className="p-4 rounded-lg bg-primary/10">
            <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
            <div className="text-2xl font-bold">{summary.winRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Setup</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">ROI</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.slice(0, 50).map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={trade.side === 'long' ? 'default' : 'secondary'}>
                      {trade.side}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{trade.setup || '-'}</TableCell>
                  <TableCell className="text-right">
                    <span className={(trade.profit_loss || 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      ${(trade.profit_loss || 0).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={(trade.roi || 0) >= 0 ? 'text-success' : 'text-destructive'}>
                      {(trade.roi || 0).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {trade.opened_at ? new Date(trade.opened_at).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTrades.length > 50 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Showing first 50 of {filteredTrades.length} results
          </p>
        )}
      </Card>
    </div>
  );
};
