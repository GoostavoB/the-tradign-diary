import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

interface TokenSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}

export const useTokenSearch = (query: string) => {
  const [results, setResults] = useState<TokenSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const searchTokens = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(debouncedQuery)}`
        );

        if (!response.ok) {
          throw new Error('Failed to search tokens');
        }

        const data = await response.json();
        setResults(data.coins?.slice(0, 10) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchTokens();
  }, [debouncedQuery]);

  return { results, loading, error };
};
