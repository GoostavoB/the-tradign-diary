import { useState, useEffect, useCallback } from 'react';
import { cacheManager } from '@/utils/cacheManager';

interface UseRequestCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
}

/**
 * Hook to fetch data with automatic caching
 * Reduces redundant API calls and improves performance
 */
export const useRequestCache = <T>({
  key,
  fetcher,
  ttl,
  enabled = true,
  refetchOnMount = false,
}: UseRequestCacheOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Check cache first
    if (!force) {
      const cached = cacheManager.get<T>(key);
      if (cached !== null) {
        setData(cached);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheManager.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  const invalidate = useCallback(() => {
    cacheManager.invalidate(key);
    fetchData(true);
  }, [key, fetchData]);

  useEffect(() => {
    if (refetchOnMount || !cacheManager.has(key)) {
      fetchData();
    } else {
      // Load from cache immediately
      const cached = cacheManager.get<T>(key);
      if (cached !== null) {
        setData(cached);
      }
    }
  }, [key, refetchOnMount, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    invalidate,
  };
};
