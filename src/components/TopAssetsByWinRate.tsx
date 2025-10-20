import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { formatPercent } from "@/utils/formatNumber";
import { ExplainMetricButton } from "@/components/ExplainMetricButton";
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { TokenIcon } from "@/components/TokenIcon";

interface AssetStats {
  asset: string;
  winRate: number;
  trades: number;
}

interface TopAssetsByWinRateProps {
  assets: AssetStats[];
  limit?: number;
}

const TopAssetsByWinRateComponent = ({ assets, limit = 5 }: TopAssetsByWinRateProps) => {
  const { openWithPrompt } = useAIAssistant();
  
  const sortedAssets = useMemo(() => 
    [...assets]
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, limit),
    [assets, limit]
  );

  return (
    <Card className="glass-card" role="region" aria-labelledby="top-assets-title">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
            <CardTitle id="top-assets-title" className="text-lg font-semibold">
              Top Assets by Win Rate
            </CardTitle>
          </div>
          <ExplainMetricButton 
            metricName="Top Assets by Win Rate"
            metricValue={`${sortedAssets.length} assets`}
            context={`Best performer: ${sortedAssets[0]?.asset} at ${formatPercent(sortedAssets[0]?.winRate)}`}
            onExplain={openWithPrompt}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3" role="list">
          {sortedAssets.map((asset, index) => (
            <li 
              key={asset.asset} 
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              role="listitem"
              aria-label={`Rank ${index + 1}: ${asset.asset} with ${formatPercent(asset.winRate)} win rate from ${asset.trades} trades`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm"
                  aria-label={`Rank ${index + 1}`}
                >
                  {index + 1}
                </div>
                <TokenIcon symbol={asset.asset} size="sm" />
                <div>
                  <p className="font-medium">{asset.asset}</p>
                  <p className="text-xs text-muted-foreground">{asset.trades} trades</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {formatPercent(asset.winRate)}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export const TopAssetsByWinRate = memo(TopAssetsByWinRateComponent);
