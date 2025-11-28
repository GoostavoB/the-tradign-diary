import { useState, useEffect } from 'react';

interface CryptoPrice {
  symbol: string;
  price: string;
  displaySymbol: string;
  priceChangePercent: number;
}

export const useCryptoPrice = (symbols: string[] = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'
]) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const results = await Promise.all(
          symbols.map(async (symbol) => {
            // Handle Bitcoin Dominance
            if (symbol === 'BTC.D') {
              try {
                const response = await fetch('https://api.coingecko.com/api/v3/global');
                if (!response.ok) throw new Error('Failed to fetch BTC dominance');
                const data = await response.json();
                const btcDominance = data.data?.market_cap_percentage?.btc || 0;
                return {
                  symbol: 'BTC.D',
                  price: btcDominance.toFixed(2),
                  displaySymbol: 'BTC.D',
                  priceChangePercent: 0 // CoinGecko doesn't provide 24h change for dominance
                };
              } catch (err) {
                console.error('BTC.D fetch error:', err);
                return null;
              }
            }
            
            // Handle S&P 500 (mock data - would need paid API for real data)
            if (symbol === 'SPX') {
              // Note: Real-time S&P 500 data requires paid APIs like Alpha Vantage, IEX Cloud, etc.
              // This is a placeholder that returns static data
              return {
                symbol: 'SPX',
                price: '5,800.00',
                displaySymbol: 'S&P 500',
                priceChangePercent: 0
              };
            }
            
            // Handle regular crypto pairs from Binance
            try {
              const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
              if (!response.ok) throw new Error(`Failed to fetch price for ${symbol}`);
              const data = await response.json();
              return {
                symbol: data.symbol,
                price: parseFloat(data.lastPrice).toFixed(2),
                displaySymbol: symbol.replace('USDT', ''),
                priceChangePercent: parseFloat(data.priceChangePercent)
              };
            } catch (err) {
              console.error(`Price fetch error for ${symbol}:`, err);
              return null;
            }
          })
        );

        const validResults = results.filter((r): r is CryptoPrice => r !== null);
        setPrices(validResults);
        setError(null);
      } catch (err) {
        setError('Failed to fetch prices');
        console.error('Price fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [symbols.join(',')]);

  return { prices, loading, error };
};
