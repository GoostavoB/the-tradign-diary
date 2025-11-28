import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Hook for infinite scrolling functionality
 * Automatically loads more data when scrolling near bottom
 */
export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  threshold = 0.8,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore, hasMore, isLoading]);

  useEffect(() => {
    if (!hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, threshold, rootMargin, handleLoadMore]);

  return {
    sentinelRef,
    isLoading,
  };
};
