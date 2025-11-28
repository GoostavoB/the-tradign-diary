import { useEffect, useCallback, useRef } from 'react';

interface MasonryGridOptions {
  rowHeight?: number;
  gap?: number;
}

export function useMasonryGrid(
  containerRef: React.RefObject<HTMLElement>,
  options: MasonryGridOptions = {}
) {
  const { rowHeight = 8, gap = 16 } = options;
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  const calculateSpan = useCallback((height: number) => {
    return Math.ceil((height + gap) / (rowHeight + gap));
  }, [rowHeight, gap]);

  const reflow = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const items = container.querySelectorAll('.widget-item');
      
      items.forEach((item) => {
        const content = item.querySelector('.widget-content');
        if (!content) return;

        const contentHeight = content.getBoundingClientRect().height;
        const span = calculateSpan(contentHeight);
        
        (item as HTMLElement).style.gridRowEnd = `span ${span}`;
      });
    });
  }, [containerRef, calculateSpan]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial reflow
    reflow();

    // Set up ResizeObserver for all widget content
    resizeObserverRef.current = new ResizeObserver(() => {
      reflow();
    });

    const observeItems = () => {
      const items = container.querySelectorAll('.widget-content');
      items.forEach((item) => {
        resizeObserverRef.current?.observe(item);
      });
    };

    observeItems();

    // Watch for DOM mutations (new widgets added/removed)
    const mutationObserver = new MutationObserver(() => {
      observeItems();
      reflow();
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    // Window resize handler
    const handleResize = () => reflow();
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      resizeObserverRef.current?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef, reflow]);

  return { reflow };
}
