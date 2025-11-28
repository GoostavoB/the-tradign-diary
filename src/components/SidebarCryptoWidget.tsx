import { useState, useEffect } from 'react';
import { useCryptoPrice } from '@/hooks/useCryptoPrice';
import { TrendingUp, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';

const AVAILABLE_TICKERS = [
  { symbol: 'BTCUSDT', display: 'BTC' },
  { symbol: 'ETHUSDT', display: 'ETH' },
  { symbol: 'BNBUSDT', display: 'BNB' },
  { symbol: 'SOLUSDT', display: 'SOL' },
  { symbol: 'XRPUSDT', display: 'XRP' },
  { symbol: 'SPX', display: 'S&P 500', isIndex: true },
  { symbol: 'BTC.D', display: 'BTC.D', isIndex: true },
];

export function SidebarCryptoWidget() {
  const { open } = useSidebar();
  
  // Load selected tickers from localStorage on mount
  const [selectedTickers, setSelectedTickers] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedCryptoTickers');
    return saved ? JSON.parse(saved) : ['BTCUSDT', 'ETHUSDT'];
  });
  
  const { prices, loading } = useCryptoPrice(selectedTickers);

  // Save selected tickers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('selectedCryptoTickers', JSON.stringify(selectedTickers));
  }, [selectedTickers]);

  const toggleTicker = (symbol: string) => {
    setSelectedTickers(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  if (!open) {
    // Collapsed state - show icon only
    return (
      <div className="p-3 flex justify-center">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-3 my-2 rounded-lg border border-border/40 bg-card/30 backdrop-blur-sm" data-tour="live-prices">
      {/* Header with dropdown */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Live Prices</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 px-1.5 hover:bg-accent/50"
            >
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-popover border-border/40">
            {AVAILABLE_TICKERS.map(ticker => (
              <DropdownMenuCheckboxItem
                key={ticker.symbol}
                checked={selectedTickers.includes(ticker.symbol)}
                onCheckedChange={() => toggleTicker(ticker.symbol)}
                className="text-xs"
              >
                {ticker.display}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Prices */}
      <div className="px-3 py-2.5">
        {loading ? (
          <div className="text-[10px] text-muted-foreground/60 text-center py-2">Loading...</div>
        ) : (
          <div className="space-y-2">
            {prices.map((price) => {
              const isPositive = price.priceChangePercent >= 0;
              
              return (
                <div key={price.symbol} className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground/80 min-w-[36px]">
                    {price.displaySymbol}
                  </span>
                  <div className="flex items-baseline gap-1.5 ml-auto">
                    <span className="text-xs font-mono font-semibold text-foreground tabular-nums">
                      ${price.price}
                    </span>
                    <span className={`text-[10px] font-mono font-medium tabular-nums ${
                      isPositive ? 'text-profit' : 'text-loss'
                    }`}>
                      {isPositive ? '+' : ''}{price.priceChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}