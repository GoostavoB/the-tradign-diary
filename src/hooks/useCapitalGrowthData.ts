import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface CapitalGrowthData {
  chartData: Array<{ date: string; value: number }>;
  initialInvestment: number;
  totalDeposits: number;
  totalWithdrawals: number;
  tradingPnL: number;
  currentBalance: number;
  growthPercent: number;
  isLoading: boolean;
}

export const useCapitalGrowthData = (): CapitalGrowthData => {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['capital-growth-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch deposits
      const { data: deposits } = await supabase
        .from('capital_log')
        .select('*')
        .eq('user_id', user.id)
        .order('log_date', { ascending: true });

      // Fetch withdrawals
      const { data: withdrawals } = await supabase
        .from('withdrawal_log')
        .select('*')
        .eq('user_id', user.id)
        .order('withdrawal_date', { ascending: true });

      // Fetch trades
      const { data: trades } = await supabase
        .from('trades')
        .select('closed_at, profit_loss')
        .eq('user_id', user.id)
        .not('closed_at', 'is', null)
        .order('closed_at', { ascending: true });

      return { deposits: deposits || [], withdrawals: withdrawals || [], trades: trades || [] };
    },
    enabled: !!user?.id,
  });

  if (isLoading || !data) {
    return {
      chartData: [],
      initialInvestment: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      tradingPnL: 0,
      currentBalance: 0,
      growthPercent: 0,
      isLoading: true,
    };
  }

  const { deposits, withdrawals, trades } = data;

  // Calculate totals
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount_added || 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount_withdrawn || 0), 0);
  const tradingPnL = trades.reduce((sum, t) => sum + Number(t.profit_loss || 0), 0);

  const initialInvestment = deposits.length > 0 ? Number(deposits[0].amount_added || 0) : 0;
  const currentBalance = totalDeposits + tradingPnL - totalWithdrawals;
  const growthPercent = totalDeposits > 0 ? ((currentBalance - totalDeposits) / totalDeposits) * 100 : 0;

  // Build daily chart data
  const eventMap = new Map<string, number>();

  // Add deposits
  deposits.forEach(d => {
    const date = format(new Date(d.log_date), 'yyyy-MM-dd');
    eventMap.set(date, (eventMap.get(date) || 0) + Number(d.amount_added || 0));
  });

  // Subtract withdrawals
  withdrawals.forEach(w => {
    const date = format(new Date(w.withdrawal_date), 'yyyy-MM-dd');
    eventMap.set(date, (eventMap.get(date) || 0) - Number(w.amount_withdrawn || 0));
  });

  // Add trading P&L
  trades.forEach(t => {
    if (t.closed_at) {
      const date = format(new Date(t.closed_at), 'yyyy-MM-dd');
      eventMap.set(date, (eventMap.get(date) || 0) + Number(t.profit_loss || 0));
    }
  });

  // Sort dates and calculate running balance
  const sortedDates = Array.from(eventMap.keys()).sort();
  const chartData: Array<{ date: string; value: number }> = [];
  let runningBalance = 0;

  sortedDates.forEach(date => {
    runningBalance += eventMap.get(date) || 0;
    chartData.push({
      date: format(new Date(date), 'MMM dd'),
      value: runningBalance,
    });
  });

  return {
    chartData,
    initialInvestment,
    totalDeposits,
    totalWithdrawals,
    tradingPnL,
    currentBalance,
    growthPercent,
    isLoading: false,
  };
};
