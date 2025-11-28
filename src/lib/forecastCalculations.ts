interface Trade {
  roi: number | null;
  margin: number | null;
  pnl: number | null;
}

export interface AdvancedStats {
  success_rate: number;
  weighted_roi_gain: number;
  weighted_roi_loss: number;
  roi_std_dev: number;
  avg_margin: number;
  total_trades: number;
  daily_growth_base: number;
  daily_growth_optimistic: number;
  daily_growth_conservative: number;
  monthly_growth_base: number;
  monthly_growth_optimistic: number;
  monthly_growth_conservative: number;
  yearly_growth_base: number;
  yearly_growth_optimistic: number;
  yearly_growth_conservative: number;
  five_year_growth_base: number;
  five_year_growth_optimistic: number;
  five_year_growth_conservative: number;
}

export const calculateAdvancedStats = (trades: Trade[]): AdvancedStats | null => {
  if (!trades || trades.length === 0) {
    return null;
  }

  // Filter valid trades with ROI data
  const validTrades = trades.filter(t => t.roi !== null && t.roi !== undefined);
  
  if (validTrades.length < 5) {
    return null; // Need minimum trades for statistical validity
  }

  const total_trades = validTrades.length;

  // Calculate success rate
  const winningTrades = validTrades.filter(t => (t.roi || 0) > 0);
  const losingTrades = validTrades.filter(t => (t.roi || 0) <= 0);
  const success_rate = winningTrades.length / total_trades;

  // Calculate weighted ROIs
  const weighted_roi_gain = winningTrades.length > 0
    ? winningTrades.reduce((sum, t) => sum + (t.roi || 0), 0) / winningTrades.length
    : 0;

  const weighted_roi_loss = losingTrades.length > 0
    ? losingTrades.reduce((sum, t) => sum + (t.roi || 0), 0) / losingTrades.length
    : 0;

  // Calculate ROI standard deviation (volatility)
  const mean_roi = validTrades.reduce((sum, t) => sum + (t.roi || 0), 0) / total_trades;
  const variance = validTrades.reduce((sum, t) => {
    const diff = (t.roi || 0) - mean_roi;
    return sum + (diff * diff);
  }, 0) / total_trades;
  const roi_std_dev = Math.sqrt(variance);

  // Calculate average margin
  const tradesWithMargin = trades.filter(t => t.margin !== null && t.margin !== undefined);
  const avg_margin = tradesWithMargin.length > 0
    ? tradesWithMargin.reduce((sum, t) => sum + (t.margin || 0), 0) / tradesWithMargin.length
    : 0;

  // Geometric expectancy calculation
  // G = (success_rate × ln(1 + ROI_gain)) + ((1 - success_rate) × ln(1 + ROI_loss))
  const roi_gain_decimal = weighted_roi_gain / 100;
  const roi_loss_decimal = weighted_roi_loss / 100;

  // Prevent ln of negative numbers
  const gain_term = roi_gain_decimal > -1 ? Math.log(1 + roi_gain_decimal) : -10;
  const loss_term = roi_loss_decimal > -1 ? Math.log(1 + roi_loss_decimal) : -10;

  const G = (success_rate * gain_term) + ((1 - success_rate) * loss_term);

  // Calculate daily growth rates for three scenarios
  const daily_growth_base = Math.exp(G) - 1;
  const std_dev_decimal = roi_std_dev / 100;
  const daily_growth_optimistic = Math.exp(G + std_dev_decimal) - 1;
  const daily_growth_conservative = Math.exp(G - std_dev_decimal) - 1;

  // Calculate compound growth for different periods
  const calculateCompoundGrowth = (dailyGrowth: number, days: number) => {
    return Math.pow(1 + dailyGrowth, days) - 1;
  };

  return {
    success_rate: success_rate * 100,
    weighted_roi_gain,
    weighted_roi_loss,
    roi_std_dev,
    avg_margin,
    total_trades,
    // Return as decimals for proper formatting later
    daily_growth_base: daily_growth_base,
    daily_growth_optimistic: daily_growth_optimistic,
    daily_growth_conservative: daily_growth_conservative,
    monthly_growth_base: calculateCompoundGrowth(daily_growth_base, 30),
    monthly_growth_optimistic: calculateCompoundGrowth(daily_growth_optimistic, 30),
    monthly_growth_conservative: calculateCompoundGrowth(daily_growth_conservative, 30),
    yearly_growth_base: calculateCompoundGrowth(daily_growth_base, 365),
    yearly_growth_optimistic: calculateCompoundGrowth(daily_growth_optimistic, 365),
    yearly_growth_conservative: calculateCompoundGrowth(daily_growth_conservative, 365),
    five_year_growth_base: calculateCompoundGrowth(daily_growth_base, 365 * 5),
    five_year_growth_optimistic: calculateCompoundGrowth(daily_growth_optimistic, 365 * 5),
    five_year_growth_conservative: calculateCompoundGrowth(daily_growth_conservative, 365 * 5),
  };
};

export interface GoalSimulatorResult {
  required_margin_percent: number;
  dollar_amount_per_trade: number;
  potential_loss_per_trade: number;
  daily_risk_exposure: number;
  is_high_risk: boolean;
  is_negative_expectancy: boolean;
}

export const calculateRequiredMargin = (
  dailyGoal: number,
  balance: number,
  winRate: number,
  avgGainRoi: number,
  avgLossRoi: number,
  tradesPerDay: number
): GoalSimulatorResult | null => {
  if (!balance || balance <= 0 || !tradesPerDay || tradesPerDay <= 0) {
    return null;
  }

  // Convert percentages to decimals
  const win_rate_decimal = winRate / 100;
  const gain_roi_decimal = avgGainRoi / 100;
  const loss_roi_decimal = avgLossRoi / 100;

  // Calculate expected value per trade (before margin)
  const expected_value_per_trade = (win_rate_decimal * gain_roi_decimal) + ((1 - win_rate_decimal) * loss_roi_decimal);

  // Check for negative expectancy
  const is_negative_expectancy = expected_value_per_trade <= 0;

  // Solve for required margin
  // daily_goal = balance × trades_per_day × margin × expected_value_per_trade
  // margin = daily_goal / (balance × trades_per_day × expected_value_per_trade)
  
  const denominator = balance * tradesPerDay * expected_value_per_trade;
  
  if (Math.abs(denominator) < 0.000001) {
    return null; // Avoid division by zero
  }

  const required_margin_decimal = dailyGoal / denominator;
  const required_margin_percent = required_margin_decimal * 100;

  // Calculate other metrics
  const dollar_amount_per_trade = required_margin_decimal * balance;
  const potential_loss_per_trade = dollar_amount_per_trade * Math.abs(loss_roi_decimal);
  const daily_risk_exposure = dollar_amount_per_trade * tradesPerDay;

  // Risk assessment
  const is_high_risk = required_margin_percent > 10;

  return {
    required_margin_percent,
    dollar_amount_per_trade,
    potential_loss_per_trade,
    daily_risk_exposure,
    is_high_risk,
    is_negative_expectancy,
  };
};
