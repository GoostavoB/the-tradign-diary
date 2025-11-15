import { differenceInDays, parseISO } from 'date-fns';

interface Trade {
  opened_at?: string | null;
  closed_at?: string | null;
  trade_date?: string | null;
}

/**
 * CONSISTENT TRADING DAYS CALCULATION
 * 
 * Supports two calculation modes:
 * 1. 'calendar': Calendar days from first opened trade to last closed trade (inclusive)
 * 2. 'unique': Only count unique days where trades were actually opened
 * 
 * This ensures ALL widgets use the same calculation method based on user preference.
 */
export function calculateTradingDays(
  trades: Trade[], 
  mode: 'calendar' | 'unique' = 'calendar'
): {
  tradingDays: number;
  firstTradeDate: Date | null;
  lastTradeDate: Date | null;
} {
  if (!trades || trades.length === 0) {
    return { tradingDays: 0, firstTradeDate: null, lastTradeDate: null };
  }

  // Filter trades that have opened_at (required for first date anchor)
  const tradesWithOpen = trades.filter(t => t.opened_at || t.trade_date);
  if (tradesWithOpen.length === 0) {
    return { tradingDays: 0, firstTradeDate: null, lastTradeDate: null };
  }

  // Sort by opened date to find first opened trade
  const sortedByOpen = [...tradesWithOpen].sort((a, b) => {
    const dateA = new Date(a.opened_at || a.trade_date!);
    const dateB = new Date(b.opened_at || b.trade_date!);
    return dateA.getTime() - dateB.getTime();
  });
  const firstTradeDate = new Date(sortedByOpen[0].opened_at || sortedByOpen[0].trade_date!);

  // For lastTradeDate, prefer closed_at if available, fallback to opened_at, then trade_date
  const tradesWithClose = trades.filter(t => t.closed_at || t.opened_at || t.trade_date);
  if (tradesWithClose.length === 0) {
    return { tradingDays: 1, firstTradeDate, lastTradeDate: firstTradeDate };
  }

  const sortedByClose = [...tradesWithClose].sort((a, b) => {
    const dateA = new Date(a.closed_at || a.opened_at || a.trade_date!);
    const dateB = new Date(b.closed_at || b.opened_at || b.trade_date!);
    return dateA.getTime() - dateB.getTime();
  });
  const lastTradeDate = new Date(
    sortedByClose[sortedByClose.length - 1].closed_at || 
    sortedByClose[sortedByClose.length - 1].opened_at || 
    sortedByClose[sortedByClose.length - 1].trade_date!
  );

  let tradingDays: number;
  
  if (mode === 'unique') {
    // Count only unique days where trades were CLOSED (end-of-day attribution)
    // Use closed_at if available, fallback to trade_date
    const uniqueDays = new Set<string>();
    tradesWithClose.forEach(t => {
      const dateToUse = t.closed_at || t.trade_date;
      if (dateToUse) {
        const dateStr = dateToUse.split('T')[0];
        const tradeDate = new Date(dateStr);
        // Only count days up to and including lastTradeDate
        if (tradeDate <= lastTradeDate) {
          uniqueDays.add(dateStr);
        }
      }
    });
    tradingDays = uniqueDays.size;
  } else {
    // Calendar days from first open to last close (inclusive, so +1)
    tradingDays = differenceInDays(lastTradeDate, firstTradeDate) + 1;
  }

  return {
    tradingDays: Math.max(1, tradingDays), // Minimum 1 day
    firstTradeDate,
    lastTradeDate,
  };
}

/**
 * Calculate average PnL per trading day
 */
export function calculateAvgPnLPerDay(
  trades: Trade[], 
  pnlField: 'pnl' | 'profit_loss' = 'profit_loss',
  mode: 'calendar' | 'unique' = 'calendar'
): number {
  const { tradingDays } = calculateTradingDays(trades, mode);
  if (tradingDays === 0) return 0;

  const totalPnL = trades.reduce((sum, t: any) => {
    return sum + (t[pnlField] || 0);
  }, 0);

  return totalPnL / tradingDays;
}
