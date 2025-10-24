import { useQuery } from '@tanstack/react-query';

interface TokenPrice {
  symbol: string;
  usd: number;
  last_updated_at: number;
}

/**
 * Fetch current price for a token from CoinGecko
 */
export function useTokenPrice(tokenSymbol: string) {
  return useQuery({
    queryKey: ['token-price', tokenSymbol],
    queryFn: async (): Promise<TokenPrice | null> => {
      if (!tokenSymbol || tokenSymbol.length < 2) {
        return null;
      }

      try {
        // First, search for the coin ID
        const searchResponse = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(tokenSymbol)}`
        );

        if (!searchResponse.ok) {
          console.error('CoinGecko search failed:', searchResponse.status);
          return null;
        }

        const searchData = await searchResponse.json();
        
        // Find the best match (exact symbol match or first result)
        const coin = searchData.coins?.find(
          (c: any) => c.symbol.toLowerCase() === tokenSymbol.toLowerCase()
        ) || searchData.coins?.[0];

        if (!coin) {
          console.log(`No coin found for symbol: ${tokenSymbol}`);
          return null;
        }

        // Fetch price data for the coin
        const priceResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_last_updated_at=true`
        );

        if (!priceResponse.ok) {
          console.error('CoinGecko price fetch failed:', priceResponse.status);
          return null;
        }

        const priceData = await priceResponse.json();
        const coinData = priceData[coin.id];

        if (!coinData) {
          return null;
        }

        return {
          symbol: tokenSymbol.toUpperCase(),
          usd: coinData.usd,
          last_updated_at: coinData.last_updated_at,
        };
      } catch (error) {
        console.error('Error fetching token price:', error);
        return null;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: tokenSymbol.length >= 2,
    retry: 1,
  });
}
