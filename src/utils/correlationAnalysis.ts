import { Trade } from '@/types/trade';

export interface AssetCorrelation {
  symbol1: string;
  symbol2: string;
  correlation: number;
  tradeCount1: number;
  tradeCount2: number;
}

export interface DiversificationScore {
  score: number; // 0-100
  interpretation: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export const calculateCorrelation = (returns1: number[], returns2: number[]): number => {
  const n = Math.min(returns1.length, returns2.length);
  if (n < 2) return 0;

  const mean1 = returns1.slice(0, n).reduce((sum, r) => sum + r, 0) / n;
  const mean2 = returns2.slice(0, n).reduce((sum, r) => sum + r, 0) / n;

  let numerator = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = returns1[i] - mean1;
    const diff2 = returns2[i] - mean2;
    numerator += diff1 * diff2;
    sum1Sq += diff1 * diff1;
    sum2Sq += diff2 * diff2;
  }

  const denominator = Math.sqrt(sum1Sq * sum2Sq);
  return denominator > 0 ? numerator / denominator : 0;
};

export const buildCorrelationMatrix = (trades: Trade[]): AssetCorrelation[] => {
  // Group trades by symbol
  const tradesBySymbol = trades.reduce((acc, trade) => {
    const symbol = trade.symbol;
    if (!acc[symbol]) acc[symbol] = [];
    acc[symbol].push(trade);
    return acc;
  }, {} as Record<string, Trade[]>);

  const symbols = Object.keys(tradesBySymbol);
  const correlations: AssetCorrelation[] = [];

  // Calculate returns for each symbol
  const returnsBySymbol: Record<string, number[]> = {};
  symbols.forEach(symbol => {
    returnsBySymbol[symbol] = tradesBySymbol[symbol]
      .map(t => (t.roi || 0) / 100)
      .filter(r => !isNaN(r));
  });

  // Calculate pairwise correlations
  for (let i = 0; i < symbols.length; i++) {
    for (let j = i + 1; j < symbols.length; j++) {
      const symbol1 = symbols[i];
      const symbol2 = symbols[j];
      
      if (returnsBySymbol[symbol1].length < 2 || returnsBySymbol[symbol2].length < 2) {
        continue;
      }

      const correlation = calculateCorrelation(
        returnsBySymbol[symbol1],
        returnsBySymbol[symbol2]
      );

      correlations.push({
        symbol1,
        symbol2,
        correlation,
        tradeCount1: tradesBySymbol[symbol1].length,
        tradeCount2: tradesBySymbol[symbol2].length,
      });
    }
  }

  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
};

export const calculateDiversificationScore = (
  correlations: AssetCorrelation[]
): DiversificationScore => {
  if (correlations.length === 0) {
    return {
      score: 50,
      interpretation: 'Insufficient data',
      riskLevel: 'medium',
      recommendations: ['Add more assets to analyze diversification'],
    };
  }

  // Calculate average absolute correlation
  const avgCorr = correlations.reduce((sum, c) => sum + Math.abs(c.correlation), 0) / correlations.length;
  
  // Score: 100 = perfectly uncorrelated (0), 0 = perfectly correlated (1)
  const score = Math.max(0, Math.min(100, (1 - avgCorr) * 100));

  let interpretation = '';
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  const recommendations: string[] = [];

  if (score >= 75) {
    interpretation = 'Excellent diversification';
    riskLevel = 'low';
    recommendations.push('Your portfolio shows strong diversification');
  } else if (score >= 50) {
    interpretation = 'Good diversification';
    riskLevel = 'medium';
    recommendations.push('Consider adding assets with lower correlation');
  } else if (score >= 25) {
    interpretation = 'Moderate diversification';
    riskLevel = 'medium';
    recommendations.push('Several assets are correlated - consider diversifying');
    recommendations.push('Look for assets in different market sectors');
  } else {
    interpretation = 'Poor diversification';
    riskLevel = 'high';
    recommendations.push('High correlation detected - portfolio is concentrated');
    recommendations.push('Consider uncorrelated assets to reduce risk');
    recommendations.push('Diversify across different asset classes');
  }

  // Check for highly correlated pairs
  const highlyCorrelated = correlations.filter(c => Math.abs(c.correlation) > 0.8);
  if (highlyCorrelated.length > 0) {
    recommendations.push(`${highlyCorrelated.length} highly correlated pair(s) detected`);
  }

  return { score, interpretation, riskLevel, recommendations };
};

export const findUncorrelatedAssets = (
  correlations: AssetCorrelation[],
  targetSymbol: string,
  threshold: number = 0.3
): string[] => {
  return correlations
    .filter(c => 
      (c.symbol1 === targetSymbol || c.symbol2 === targetSymbol) &&
      Math.abs(c.correlation) < threshold
    )
    .map(c => c.symbol1 === targetSymbol ? c.symbol2 : c.symbol1);
};
