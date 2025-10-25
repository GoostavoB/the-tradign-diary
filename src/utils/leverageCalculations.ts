/**
 * Leverage and Stop Loss Calculator Utilities
 * Core math for crypto futures trading
 * 
 * Mathematical Foundation:
 * - Leverage (L): Position size multiplier relative to margin
 * - Stop Loss Distance (δ): Percentage distance from entry to stop
 * - Liquidation Buffer (B): Safety margin before liquidation
 * - Liquidation Distance (d_liq): Distance to liquidation price
 * 
 * Key Formula: L_max = 1 / (δ + B)
 * Where δ and B are expressed as decimals (e.g., 2% = 0.02)
 */

export const LEVERAGE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 100];

export type Side = "long" | "short";
export type RiskLevel = "Low" | "Medium" | "High";
export type SizeMode = "quote" | "base";

export function pct(n: number): number {
  return n * 100;
}

export function clamp(val: number, lo: number, hi: number): number {
  return Math.min(Math.max(val, lo), hi);
}

export function roundDownToStep(val: number, steps: number[]): number {
  const sorted = [...steps].sort((a, b) => a - b);
  let r = sorted[0];
  for (const s of sorted) {
    if (s <= val) r = s;
    else break;
  }
  return r;
}

/**
 * Calculate stop loss distance as percentage
 * Formula: δ = |P_entry - P_stop| / P_entry × 100
 * 
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @returns Stop distance as percentage (e.g., 2.5 for 2.5%)
 */
export function stopPercentFromPrices(entry: number, stop: number): number {
  return Math.abs((entry - stop) / entry) * 100;
}

/**
 * Calculate stop loss price from percentage distance
 * Formula (Long): P_stop = P_entry × (1 - δ)
 * Formula (Short): P_stop = P_entry × (1 + δ)
 * 
 * @param entry - Entry price
 * @param sPct - Stop distance as percentage (e.g., 2.5 for 2.5%)
 * @param side - Position side ("long" or "short")
 * @returns Stop loss price
 */
export function stopPriceFromPercent(entry: number, sPct: number, side: Side): number {
  const s = sPct / 100;
  return side === "long" ? entry * (1 - s) : entry * (1 + s);
}

/**
 * Calculate maximum safe leverage from stop distance
 * Formula: L* = 1 / (δ + B)
 * Then rounds down to nearest available leverage step
 * 
 * @param sPct - Stop distance as percentage (e.g., 2.5 for 2.5%)
 * @param bufferB - Liquidation buffer as percentage (e.g., 0.5 for 0.5%)
 * @param cap - Maximum leverage cap (e.g., 100)
 * @returns Maximum safe leverage (rounded down, capped)
 */
export function maxLeverageFromStopPercent(sPct: number, bufferB: number, cap: number): number {
  const Lstar = 1 / (sPct / 100 + bufferB / 100);
  const rounded = roundDownToStep(Lstar, LEVERAGE_STEPS);
  return Math.min(Math.max(rounded, 1), cap);
}

/**
 * Calculate approximate liquidation price
 * Formula: d_liq = max(1/L - B, 0)
 * Formula (Long): P_liq = P_entry × (1 - d_liq)
 * Formula (Short): P_liq = P_entry × (1 + d_liq)
 * 
 * @param entry - Entry price
 * @param L - Leverage multiplier
 * @param bufferB - Liquidation buffer as percentage (e.g., 0.5 for 0.5%)
 * @param side - Position side ("long" or "short")
 * @returns Approximate liquidation price
 */
export function liquidationPriceApprox(entry: number, L: number, bufferB: number, side: Side): number {
  const dliq = Math.max(1 / L - bufferB / 100, 0);
  return side === "long" ? entry * (1 - dliq) : entry * (1 + dliq);
}

/**
 * Calculate safety margin between stop and liquidation
 * The "cushion" distance between stop loss and liquidation price
 * Formula (Long): margin% = (P_stop - P_liq) / P_entry × 100
 * Formula (Short): margin% = (P_liq - P_stop) / P_entry × 100
 * 
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @param pliq - Liquidation price
 * @param side - Position side ("long" or "short")
 * @returns Safety margin as percentage
 */
export function safetyMarginPercent(entry: number, stop: number, pliq: number, side: Side): number {
  if (side === "long") return ((stop - pliq) / entry) * 100;
  return ((pliq - stop) / entry) * 100;
}

/**
 * Calculate risk value in quote currency (e.g., USDT)
 * Formula: Risk = |P_entry - P_stop| × (Quote_Size / P_entry)
 * 
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @param quoteSize - Position size in quote currency (e.g., $1000 USDT)
 * @returns Risk amount in quote currency
 */
export function riskValueQuote(entry: number, stop: number, quoteSize: number): number {
  return Math.abs(entry - stop) * (quoteSize / entry);
}

/**
 * Calculate risk value from base quantity
 * Formula: Risk = |P_entry - P_stop| × Base_Quantity
 * 
 * @param entry - Entry price
 * @param stop - Stop loss price
 * @param baseQty - Position size in base currency (e.g., 0.5 BTC)
 * @returns Risk amount in quote currency
 */
export function riskValueBase(entry: number, stop: number, baseQty: number): number {
  return Math.abs(entry - stop) * baseQty;
}

/**
 * Determine risk level from leverage and safety margin
 * Classification:
 * - Low: L ≤ 20x AND margin ≥ 0.75%
 * - High: L > 50x OR margin < 0.25%
 * - Medium: Everything else
 * 
 * @param L - Leverage multiplier
 * @param marginPct - Safety margin percentage
 * @returns Risk level classification
 */
export function riskLevelFrom(L: number, marginPct: number): RiskLevel {
  if (L <= 20 && marginPct >= 0.75) return "Low";
  if (L > 50 || marginPct < 0.25) return "High";
  return "Medium";
}

export interface CalculationResult {
  deltaPct: number;
  Lstar: number;
  Lmax: number;
  dliqUsed: number;
  pliq: number;
  marginPct: number;
  riskLevel: RiskLevel;
  riskValue?: number;
  stop: number;
  isValid: boolean;
  warnings: string[];
}

export function calculateLeverageMetrics(
  entry: number,
  stop: number,
  desiredLeverage: number | null,
  side: Side,
  bufferB: number,
  maxLeverageCap: number,
  sizeValue: number | null,
  sizeMode: SizeMode
): CalculationResult {
  const warnings: string[] = [];
  
  // Validate entry and stop
  if (entry <= 0 || stop <= 0) {
    return {
      deltaPct: 0,
      Lstar: 0,
      Lmax: 1,
      dliqUsed: 0,
      pliq: 0,
      marginPct: 0,
      riskLevel: "High",
      stop,
      isValid: false,
      warnings: ["Invalid prices"],
    };
  }

  // Check if stop is on correct side
  if (side === "long" && stop >= entry) {
    warnings.push("Stop should be below entry for long positions");
  }
  if (side === "short" && stop <= entry) {
    warnings.push("Stop should be above entry for short positions");
  }

  const deltaPct = stopPercentFromPrices(entry, stop);
  
  if (deltaPct === 0) {
    warnings.push("Stop cannot equal entry");
    return {
      deltaPct: 0,
      Lstar: 0,
      Lmax: 1,
      dliqUsed: 0,
      pliq: entry,
      marginPct: 0,
      riskLevel: "High",
      stop,
      isValid: false,
      warnings,
    };
  }

  // Calculate max safe leverage
  const Lstar = 1 / (deltaPct / 100 + bufferB / 100);
  const Lmax = maxLeverageFromStopPercent(deltaPct, bufferB, maxLeverageCap);

  // Use desired leverage if provided and valid, otherwise use Lmax
  let usedLeverage = Lmax;
  if (desiredLeverage !== null) {
    if (desiredLeverage > Lmax) {
      warnings.push(`Desired leverage ${desiredLeverage}x exceeds safe max ${Lmax}x`);
      usedLeverage = Lmax;
    } else {
      usedLeverage = desiredLeverage;
    }
  }

  // Calculate liquidation price
  const pliq = liquidationPriceApprox(entry, usedLeverage, bufferB, side);
  
  // Calculate safety margin
  const marginPct = safetyMarginPercent(entry, stop, pliq, side);
  
  // Calculate risk level
  const riskLevel = riskLevelFrom(usedLeverage, marginPct);

  // Calculate risk value if size provided
  let riskValue: number | undefined;
  if (sizeValue !== null && sizeValue > 0) {
    riskValue = sizeMode === "quote" 
      ? riskValueQuote(entry, stop, sizeValue)
      : riskValueBase(entry, stop, sizeValue);
  }

  // Additional warnings
  if (Lmax === 1) {
    warnings.push("Stop too wide for leverage increase");
  }
  if (marginPct < 0.25) {
    warnings.push("High risk: Stop is close to liquidation");
  }

  return {
    deltaPct,
    Lstar,
    Lmax,
    dliqUsed: Math.max(1 / usedLeverage - bufferB / 100, 0),
    pliq,
    marginPct,
    riskLevel,
    riskValue,
    stop,
    isValid: warnings.length === 0 || warnings.every(w => w.includes("exceeds safe max")),
    warnings,
  };
}
