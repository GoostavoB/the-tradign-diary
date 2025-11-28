/**
 * Bundle optimization utilities
 * Reduce bundle size and improve load times
 */

/**
 * Dynamically import heavy dependencies
 */
export const lazyLoadDependency = async <T>(
  importFn: () => Promise<{ default: T } | T>
): Promise<T> => {
  const module = await importFn();
  if (module && typeof module === 'object' && 'default' in module) {
    return module.default as T;
  }
  return module as T;
};

/**
 * Code splitting helper for routes
 */
export const createLazyRoute = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  return React.lazy(factory);
};

/**
 * Defer non-critical scripts
 */
export const deferScript = (src: string, attributes: Record<string, string> = {}) => {
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  
  Object.entries(attributes).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });
  
  document.body.appendChild(script);
  return script;
};

/**
 * Load script only when idle
 */
export const loadWhenIdle = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 1);
  }
};

/**
 * Load module when visible
 */
export const loadWhenVisible = (
  element: HTMLElement,
  callback: () => void
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.01 }
  );
  
  observer.observe(element);
  return observer;
};

/**
 * Chunk data for progressive loading
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Progressive enhancement loader
 */
export const progressiveLoad = async <T>(
  dataSource: () => Promise<T[]>,
  onChunkLoaded: (chunk: T[], isComplete: boolean) => void,
  chunkSize: number = 20
) => {
  const data = await dataSource();
  const chunks = chunkArray(data, chunkSize);
  
  for (let i = 0; i < chunks.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 0)); // Yield to main thread
    const isComplete = i === chunks.length - 1;
    onChunkLoaded(chunks[i], isComplete);
  }
};

/**
 * Tree-shake unused exports helper
 * Use this pattern for conditional imports
 */
export const conditionalImport = async <T>(
  condition: boolean,
  truePath: () => Promise<T>,
  falsePath?: () => Promise<T>
): Promise<T | null> => {
  if (condition) {
    return truePath();
  } else if (falsePath) {
    return falsePath();
  }
  return null;
};

// Re-export React for lazy loading helper
import React from 'react';
