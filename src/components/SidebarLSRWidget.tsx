import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, ChevronDown } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LSRData {
  longShortRatio: number;
  change: number;
  openInterest: number;
  openInterestChange: number;
}

type TimeFrame = '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d';

const TIME_FRAMES: { value: TimeFrame; label: string }[] = [
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '2h', label: '2h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
];

export function SidebarLSRWidget() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const [lsrData, setLsrData] = useState<LSRData | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('15m');

  const handleWidgetClick = () => {
    navigate('/market-data');
  };

  useEffect(() => {
    const fetchBinanceLSR = async () => {
      try {
        const [lsrResponse, oiResponse] = await Promise.all([
          fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=BTCUSDT&period=${timeFrame}&limit=2`),
          fetch(`https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=${timeFrame}&limit=2`)
        ]);

        const lsrJson = await lsrResponse.json();
        const oiJson = await oiResponse.json();

        if (lsrJson && lsrJson.length >= 2) {
          const current = parseFloat(lsrJson[0].longShortRatio);
          const previous = parseFloat(lsrJson[1].longShortRatio);
          const change = ((current - previous) / previous) * 100;

          const currentOI = parseFloat(oiJson[0].sumOpenInterest);
          const previousOI = parseFloat(oiJson[1].sumOpenInterest);
          const oiChange = ((currentOI - previousOI) / previousOI) * 100;

          setLsrData({
            longShortRatio: current,
            change: change,
            openInterest: currentOI,
            openInterestChange: oiChange
          });
        }
      } catch (error) {
        console.error('Failed to fetch LSR data:', error);
      }
    };

    fetchBinanceLSR();
    const interval = setInterval(fetchBinanceLSR, 15000);
    return () => clearInterval(interval);
  }, [timeFrame]);

  if (!lsrData) return null;

  if (!open) {
    return (
      <div className="p-3 flex justify-center">
        <Activity className="h-4 w-4 text-primary" />
      </div>
    );
  }

  const isLsrPositive = lsrData.change >= 0;
  const isOiPositive = lsrData.openInterestChange >= 0;

  return (
    <div 
      className="mx-3 my-2 rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm cursor-pointer hover:border-primary/50 hover:bg-card/50 transition-all duration-200" 
      data-tour="market-data-widget"
      onClick={handleWidgetClick}
    >
      {/* Header with Time Frame Selector */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Market Data</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 px-1.5 text-[10px] font-medium hover:bg-accent/50"
              onClick={(e) => e.stopPropagation()}
            >
              {timeFrame}
              <ChevronDown className="h-3 w-3 ml-0.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-20 bg-popover border-border/40 z-50">
            <DropdownMenuRadioGroup value={timeFrame} onValueChange={(value) => setTimeFrame(value as TimeFrame)}>
              {TIME_FRAMES.map((tf) => (
                <DropdownMenuRadioItem key={tf.value} value={tf.value} className="text-xs">
                  {tf.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Premium Compact Display */}
      <div className="px-3 py-2.5 space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] text-muted-foreground/60 font-medium">LSR (BTC)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
              {lsrData.longShortRatio.toFixed(4)}
            </span>
            <span className={`text-[10px] font-mono font-medium tabular-nums ${
              isLsrPositive ? 'text-profit' : 'text-loss'
            }`}>
              {isLsrPositive ? '+' : ''}{lsrData.change.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] text-muted-foreground/60 font-medium">Open Interest</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
              ${(lsrData.openInterest / 1e9).toFixed(2)}B
            </span>
            <span className={`text-[10px] font-mono font-medium tabular-nums ${
              isOiPositive ? 'text-profit' : 'text-loss'
            }`}>
              {isOiPositive ? '+' : ''}{lsrData.openInterestChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
