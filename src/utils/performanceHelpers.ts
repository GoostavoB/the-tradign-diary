/**
 * Performance helper utilities
 * Common functions for optimizing application performance
 */

/**
 * Throttle function execution
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
};

/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get optimal animation duration based on user preference
 */
export const getAnimationDuration = (defaultDuration: number): number => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};

/**
 * Measure function execution time (dev only)
 */
export const measurePerformance = async <T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> => {
  if (import.meta.env.PROD) {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > 16) {
      console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};

/**
 * Lazy load module with retry logic
 */
export const lazyLoadWithRetry = <T>(
  importFn: () => Promise<T>,
  retries = 3,
  interval = 1000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const attempt = (n: number) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (n === 1) {
            reject(error);
          } else {
            setTimeout(() => attempt(n - 1), interval);
          }
        });
    };
    attempt(retries);
  });
};

/**
 * Batch array processing to avoid blocking the main thread
 */
export const batchProcess = async <T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize = 100
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = batch.map(processor);
    results.push(...batchResults);
    
    // Yield to main thread between batches
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

/**
 * Check if device is low-end based on hardware concurrency
 */
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 4;
  return cores <= 2;
};
