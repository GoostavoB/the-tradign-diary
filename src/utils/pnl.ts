import type { Trade } from '@/types/trade';

/**
 * STANDARDIZED PNL CALCULATION
 * 
 * Provides consistent net/gross PnL calculation across all widgets.
 * Net PnL = profit_loss - |funding_fee| - |trading_fee|
 * Gross PnL = profit_loss only
 */

export interface PnLOptions {
  includeFees?: boolean;
}

// Simple trade interface that works with partial trade data
export interface SimpleTrade {
  profit_loss?: number | null;
  pnl?: number | null;
  funding_fee?: number | null;
  trading_fee?: number | null;
}

/**
 * Calculate net or gross PnL for a single trade
 */
export function calculateTradePnL(trade: SimpleTrade | Trade, options: PnLOptions = { includeFees: true }): number {
  const grossPnL = trade.profit_loss || (trade as SimpleTrade).pnl || 0;
  
  if (!options.includeFees) {
    return grossPnL;
  }
  
  const fundingFee = Math.abs((trade as Trade).funding_fee || 0);
  const tradingFee = Math.abs((trade as Trade).trading_fee || 0);
  
  return grossPnL - fundingFee - tradingFee;
}

/**
 * Calculate total net or gross PnL across multiple trades
 */
export function calculateTotalPnL(trades: (SimpleTrade | Trade)[], options: PnLOptions = { includeFees: true }): number {
  return trades.reduce((sum, trade) => sum + calculateTradePnL(trade, options), 0);
}
