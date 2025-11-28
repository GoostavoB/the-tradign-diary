import { PremiumCard } from '@/components/ui/PremiumCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, Percent, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calculatePeriodBasedROI } from '@/utils/capitalCalculations';
import { format } from 'date-fns';
import { BlurredCurrency, BlurredPercent } from '@/components/ui/BlurredValue';

interface Trade {
  pnl?: number | null;
  profit_loss?: number | null;
  trade_date?: string | null;
  closed_at?: string | null;
}

interface CapitalLogEntry {
  id: string;
  log_date: string;
  amount_added: number;
  total_after: number;
  notes?: string;
}

export const PeriodBasedROI = () => {
  // Fetch trades
  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('pnl, profit_loss, trade_date, closed_at')
        .is('deleted_at', null);

      if (error) throw error;
      return data as Trade[];
    },
  });

  // Fetch capital log
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

  const { periods, weightedROI } = calculatePeriodBasedROI(trades, capitalLog);

  if (isLoading) {
    return (
      <PremiumCard className="p-6 glass-strong">
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading period-based ROI...</p>
        </div>
      </PremiumCard>
    );
  }

  if (periods.length === 0) {
    return (
      <PremiumCard className="p-6 glass-strong">
        <div className="text-center py-8">
          <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Add capital entries to see period-based ROI calculations
          </p>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard className="p-6 glass-strong">
      <div className="mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Percent className="h-5 w-5 text-accent" />
          Period-Based ROI Analysis
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          ROI calculated separately for each capital period to preserve historical accuracy
        </p>
      </div>

      {/* Weighted ROI Summary */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Weighted Average ROI</p>
            <p className="text-3xl font-bold flex items-center gap-2 mt-1">
              {weightedROI > 0 ? (
                <TrendingUp className="h-6 w-6 text-positive" />
              ) : (
                <TrendingDown className="h-6 w-6 text-negative" />
              )}
              <span className={weightedROI >= 0 ? 'text-positive' : 'text-negative'}>
                <BlurredPercent value={weightedROI} />
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Periods</p>
            <p className="text-2xl font-semibold">{periods.length}</p>
          </div>
        </div>
      </div>

      {/* Periods Table */}
      <div className="border rounded-lg glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Starting Capital</TableHead>
              <TableHead>Profit/Loss</TableHead>
              <TableHead>ROI</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period, index) => {
              const isActive = !period.endDate;
              return (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {format(new Date(period.startDate), 'MMM dd, yyyy')}
                        </p>
                        {period.endDate ? (
                          <p className="text-xs text-muted-foreground">
                            to {format(new Date(period.endDate), 'MMM dd, yyyy')}
                          </p>
                        ) : (
                          <Badge variant="secondary" className="mt-1">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        <BlurredCurrency amount={period.startingCapital} className="inline" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${period.profit >= 0 ? 'text-positive' : 'text-negative'
                        }`}
                    >
                      {period.profit >= 0 ? '+' : ''}<BlurredCurrency amount={Math.abs(period.profit)} className="inline" />
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {period.roi >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-positive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-negative" />
                      )}
                      <span
                        className={`font-bold ${period.roi >= 0 ? 'text-positive' : 'text-negative'
                          }`}
                      >
                        <BlurredPercent value={period.roi} className="inline" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {period.notes || '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-xs text-muted-foreground">
          💡 <strong>How it works:</strong> Each capital addition creates a new period. ROI is calculated
          separately for each period, then weighted by capital size to give you an accurate overall return.
          This ensures that adding more capital doesn't distort your historical performance metrics.
        </p>
      </div>
    </PremiumCard>
  );
};
