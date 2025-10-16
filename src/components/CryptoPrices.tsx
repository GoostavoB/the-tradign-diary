import { useCryptoPrice } from '@/hooks/useCryptoPrice';
import { TrendingUp } from 'lucide-react';

interface CryptoPricesProps {
  className?: string;
  symbols?: string[];
}

const cryptoColors: Record<string, string> = {
  'BTC': 'text-orange-500',
  'ETH': 'text-slate-400',
  'BNB': 'text-yellow-400',
  'SOL': 'text-purple-500',
  'XRP': 'text-gray-400',
  'DOGE': 'text-yellow-500',
  'TRX': 'text-red-600',
  'TON': 'text-sky-400',
  'ADA': 'text-blue-700',
  'AVAX': 'text-red-500',
};

export const CryptoPrices = ({ className = '', symbols }: CryptoPricesProps) => {
  const { prices, loading, error } = useCryptoPrice(symbols);

  if (loading) {
    return (
      <div className={`bg-card/30 backdrop-blur-sm border-b border-border ${className}`}>
        <div className="container mx-auto px-6 py-4">
          <p className="text-sm text-muted-foreground">Loading prices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show error bar at top
  }

  return (
    <div className={`bg-card/30 backdrop-blur-sm border-b border-border ${className}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-3 flex-shrink-0">
            <TrendingUp className="text-neon-green" size={24} />
            <span className="text-base font-semibold text-muted-foreground">LIVE:</span>
          </div>
          {prices.map((price) => (
            <div key={price.symbol} className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-base font-semibold ${cryptoColors[price.displaySymbol] || 'text-foreground'}`}>
                {price.displaySymbol}
              </span>
              <span className={`text-base font-mono font-bold drop-shadow-[0_0_8px_currentColor] ${cryptoColors[price.displaySymbol] || 'text-neon-green'}`}>
                ${price.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
