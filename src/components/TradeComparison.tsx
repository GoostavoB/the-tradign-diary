import { PremiumCard } from "@/components/ui/PremiumCard";
import { Trade } from "@/types/trade";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

interface TradeComparisonProps {
  trades: Trade[];
}

export const TradeComparison = ({ trades }: TradeComparisonProps) => {
  if (trades.length < 2) {
    return (
      <PremiumCard className="p-8 text-center">
        <p className="text-muted-foreground">Select at least 2 trades to compare</p>
      </PremiumCard>
    );
  }

  const compareValue = (trade1: Trade, trade2: Trade, key: keyof Trade) => {
    const val1 = trade1[key] as number;
    const val2 = trade2[key] as number;

    if (val1 > val2) return "higher";
    if (val1 < val2) return "lower";
    return "equal";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Trade Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trades.map((trade, idx) => (
          <PremiumCard key={trade.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Trade {idx + 1}</Badge>
              <Badge className={trade.side === "long" ? "bg-green-500" : "bg-red-500"}>
                {trade.side?.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Symbol</p>
                <p className="font-semibold">{trade.symbol_temp}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Entry</p>
                  <p className="font-semibold">${trade.entry_price?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Exit</p>
                  <p className="font-semibold">${trade.exit_price?.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">P&L</p>
                <p className={`text-lg font-bold flex items-center gap-1 ${(trade.profit_loss || 0) >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                  {(trade.profit_loss || 0) >= 0 ?
                    <TrendingUp className="h-4 w-4" /> :
                    <TrendingDown className="h-4 w-4" />
                  }
                  ${trade.profit_loss?.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">ROI</p>
                  <p className="font-semibold">{trade.roi?.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold">
                    {trade.duration_days}d {trade.duration_hours}h
                  </p>
                </div>
              </div>

              {trade.setup && (
                <div>
                  <p className="text-xs text-muted-foreground">Setup</p>
                  <Badge variant="secondary" className="text-xs">{trade.setup}</Badge>
                </div>
              )}

              {trade.emotional_tag && (
                <div>
                  <p className="text-xs text-muted-foreground">Emotional State</p>
                  <Badge variant="outline" className="text-xs">{trade.emotional_tag}</Badge>
                </div>
              )}
            </div>
          </PremiumCard>
        ))}
      </div>

      {trades.length === 2 && (
        <PremiumCard className="p-4 bg-muted/50">
          <h4 className="font-semibold mb-3 text-sm">Key Differences</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-2">Profit/Loss</p>
              <p>
                Trade 1: <span className="font-semibold">${trades[0].profit_loss?.toFixed(2)}</span>
                <br />
                Trade 2: <span className="font-semibold">${trades[1].profit_loss?.toFixed(2)}</span>
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Difference: ${Math.abs((trades[0].profit_loss || 0) - (trades[1].profit_loss || 0)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">ROI</p>
              <p>
                Trade 1: <span className="font-semibold">{trades[0].roi?.toFixed(2)}%</span>
                <br />
                Trade 2: <span className="font-semibold">{trades[1].roi?.toFixed(2)}%</span>
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Difference: {Math.abs((trades[0].roi || 0) - (trades[1].roi || 0)).toFixed(2)}%
              </p>
            </div>
          </div>
        </PremiumCard>
      )}
    </div>
  );
};
