import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Trade } from '@/types/trade';
import { buildCorrelationMatrix, calculateDiversificationScore } from '@/utils/correlationAnalysis';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CorrelationMatrixProps {
  trades: Trade[];
}

export const CorrelationMatrix = ({ trades }: CorrelationMatrixProps) => {
  const { correlations, diversificationScore } = useMemo(() => {
    const corr = buildCorrelationMatrix(trades);
    const score = calculateDiversificationScore(corr);
    return { correlations: corr, diversificationScore: score };
  }, [trades]);

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'bg-destructive/20 text-destructive';
    if (abs > 0.4) return 'bg-warning/20 text-warning';
    return 'bg-success/20 text-success';
  };

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.3) return <TrendingUp className="h-4 w-4" />;
    if (correlation < -0.3) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Portfolio Diversification Score</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-bold">{diversificationScore.score.toFixed(0)}</div>
          <div className="flex-1">
            <div className="text-sm font-medium">{diversificationScore.interpretation}</div>
            <Badge variant={
              diversificationScore.riskLevel === 'low' ? 'default' : 
              diversificationScore.riskLevel === 'medium' ? 'secondary' : 
              'destructive'
            }>
              {diversificationScore.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-gradient-to-r from-destructive via-warning to-success transition-all"
            style={{ width: `${diversificationScore.score}%` }}
          />
        </div>

        <div className="space-y-2">
          {diversificationScore.recommendations.map((rec, idx) => (
            <div key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Asset Correlations</h3>
        
        {correlations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Trade at least 2 different assets to see correlations
          </p>
        ) : (
          <div className="space-y-3">
            {correlations.slice(0, 10).map((corr, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-3 rounded-lg ${getCorrelationColor(corr.correlation)}`}
              >
                <div className="flex items-center gap-3">
                  {getCorrelationIcon(corr.correlation)}
                  <div>
                    <div className="font-medium">{corr.symbol1} ↔ {corr.symbol2}</div>
                    <div className="text-xs opacity-70">
                      {corr.tradeCount1} trades · {corr.tradeCount2} trades
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{(corr.correlation * 100).toFixed(0)}%</div>
                  <div className="text-xs opacity-70">
                    {Math.abs(corr.correlation) > 0.7 ? 'Strong' : 
                     Math.abs(corr.correlation) > 0.4 ? 'Moderate' : 
                     'Weak'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
