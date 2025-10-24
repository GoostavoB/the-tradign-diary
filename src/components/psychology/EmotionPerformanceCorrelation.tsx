import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Brain, AlertTriangle } from "lucide-react";
import { getTagColor } from "@/constants/tradingTags";

interface TagCorrelation {
  tag: string;
  type: 'emotion' | 'error';
  count: number;
  avgPnl: number;
  winRate: number;
  totalPnl: number;
}

export function EmotionPerformanceCorrelation() {
  const { user } = useAuth();

  const { data: correlations, isLoading } = useQuery({
    queryKey: ['tag-correlations', user?.id],
    queryFn: async () => {
      const { data: trades, error } = await supabase
        .from('trades')
        .select('emotion_tags, error_tags, pnl')
        .eq('user_id', user?.id)
        .not('emotion_tags', 'is', null)
        .not('pnl', 'is', null);

      if (error) throw error;

      const tagStats = new Map<string, { count: number; wins: number; totalPnl: number; type: 'emotion' | 'error' }>();

      trades?.forEach((trade) => {
        const pnl = Number(trade.pnl) || 0;
        const isWin = pnl > 0;

        // Process emotion tags
        trade.emotion_tags?.forEach((tag: string) => {
          const stats = tagStats.get(tag) || { count: 0, wins: 0, totalPnl: 0, type: 'emotion' as const };
          stats.count++;
          if (isWin) stats.wins++;
          stats.totalPnl += pnl;
          tagStats.set(tag, stats);
        });

        // Process error tags
        trade.error_tags?.forEach((tag: string) => {
          const stats = tagStats.get(tag) || { count: 0, wins: 0, totalPnl: 0, type: 'error' as const };
          stats.count++;
          if (isWin) stats.wins++;
          stats.totalPnl += pnl;
          tagStats.set(tag, stats);
        });
      });

      const results: TagCorrelation[] = Array.from(tagStats.entries())
        .map(([tag, stats]) => ({
          tag,
          type: stats.type,
          count: stats.count,
          avgPnl: stats.totalPnl / stats.count,
          winRate: (stats.wins / stats.count) * 100,
          totalPnl: stats.totalPnl,
        }))
        .filter(c => c.count >= 3) // Only show tags with 3+ trades
        .sort((a, b) => b.count - a.count);

      return results;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Tag Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading correlations...</p>
        </CardContent>
      </Card>
    );
  }

  if (!correlations || correlations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Tag Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              Not enough tagged trades yet. Tag your trades with emotions and errors to see correlations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const positiveCorrelations = correlations.filter(c => c.avgPnl > 0).slice(0, 5);
  const negativeCorrelations = correlations.filter(c => c.avgPnl < 0).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Tag Performance Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How emotions and errors correlate with your trading results
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positive Correlations */}
        {positiveCorrelations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-600">Best Performing Tags</h3>
            </div>
            <div className="space-y-3">
              {positiveCorrelations.map((correlation) => (
                <div key={correlation.tag} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getTagColor(correlation.tag, correlation.type)}>
                      {correlation.tag}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        +${Math.abs(correlation.avgPnl).toFixed(2)} avg
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {correlation.count} trades • {correlation.winRate.toFixed(0)}% win rate
                      </div>
                    </div>
                  </div>
                  <Progress value={correlation.winRate} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Negative Correlations */}
        {negativeCorrelations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-600">Tags to Watch</h3>
            </div>
            <div className="space-y-3">
              {negativeCorrelations.map((correlation) => (
                <div key={correlation.tag} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getTagColor(correlation.tag, correlation.type)}>
                      {correlation.tag}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-red-600">
                        -${Math.abs(correlation.avgPnl).toFixed(2)} avg
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {correlation.count} trades • {correlation.winRate.toFixed(0)}% win rate
                      </div>
                    </div>
                  </div>
                  <Progress value={correlation.winRate} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Key Insights
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {negativeCorrelations.length > 0 && (
              <li>• Avoid trading when experiencing: {negativeCorrelations.slice(0, 3).map(c => c.tag).join(', ')}</li>
            )}
            {positiveCorrelations.length > 0 && (
              <li>• Best results occur with: {positiveCorrelations.slice(0, 3).map(c => c.tag).join(', ')}</li>
            )}
            <li>• Track your emotional state consistently for better insights</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
