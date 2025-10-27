import { useState, useEffect, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LSRData {
  longShortRatio: number;
  change24h: number;
  openInterest: number;
  openInterestChange24h: number;
}

export const LSRInsightCard = memo(() => {
  const navigate = useNavigate();
  const [lsrData, setLsrData] = useState<LSRData | null>(null);

  useEffect(() => {
    const fetchBinanceLSR = async () => {
      try {
        const [lsrResponse, oiResponse] = await Promise.all([
          fetch('https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=1d&limit=2'),
          fetch('https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=2')
        ]);

        const lsrJson = await lsrResponse.json();
        const oiJson = await oiResponse.json();

        if (lsrJson && lsrJson.length >= 2 && oiJson && oiJson.length >= 2) {
          const current = parseFloat(lsrJson[0].longShortRatio);
          const previous = parseFloat(lsrJson[1].longShortRatio);
          const change = ((current - previous) / previous) * 100;

          const currentOI = parseFloat(oiJson[0].sumOpenInterest);
          const previousOI = parseFloat(oiJson[1].sumOpenInterest);
          const oiChange = ((currentOI - previousOI) / previousOI) * 100;

          setLsrData({
            longShortRatio: current,
            change24h: change,
            openInterest: currentOI,
            openInterestChange24h: oiChange
          });
        }
      } catch (error) {
        console.error('Failed to fetch LSR data:', error);
      }
    };

    fetchBinanceLSR();
    const interval = setInterval(fetchBinanceLSR, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (!lsrData) return null;

  const handleClick = () => {
    navigate('/market-data');
  };

  const isLsrPositive = lsrData.change24h >= 0;
  const isOiPositive = lsrData.openInterestChange24h >= 0;

  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group" 
      onClick={handleClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Long/Short Ratio</h3>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            Market
          </Badge>
        </div>

        <div className="space-y-2">
          {/* LSR Data */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">LSR (BTC)</span>
            <span className="text-lg font-bold text-foreground tabular-nums">
              {lsrData.longShortRatio.toFixed(4)}
            </span>
            <span className={`text-xs font-medium tabular-nums flex items-center gap-0.5 ${
              isLsrPositive ? 'text-profit' : 'text-loss'
            }`}>
              {isLsrPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isLsrPositive ? '+' : ''}{lsrData.change24h.toFixed(2)}%
            </span>
          </div>

          {/* Open Interest Data */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">Open Interest</span>
            <span className="text-lg font-bold text-foreground tabular-nums">
              ${(lsrData.openInterest / 1e9).toFixed(2)}B
            </span>
            <span className={`text-xs font-medium tabular-nums flex items-center gap-0.5 ${
              isOiPositive ? 'text-profit' : 'text-loss'
            }`}>
              {isOiPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isOiPositive ? '+' : ''}{lsrData.openInterestChange24h.toFixed(2)}%
            </span>
          </div>

          <div className="pt-1">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {lsrData.longShortRatio > 1 
                ? 'More traders are long than short - bullish sentiment'
                : 'More traders are short than long - bearish sentiment'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">(24h)</span>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 group-hover:gap-2 transition-all">
            View Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

LSRInsightCard.displayName = 'LSRInsightCard';
