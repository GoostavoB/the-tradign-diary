/**
 * Performance configuration and feature flags
 * Centralized settings for optimization features
 */

export const performanceConfig = {
  // Lazy loading
  lazyLoading: {
    enabled: true,
    rootMargin: '100px', // Start loading before element enters viewport
    threshold: 0.1,
  },

  // Virtual scrolling
  virtualScroll: {
    enabled: true,
    itemHeight: 60, // Default row height
    overscan: 5, // Extra items to render outside viewport
  },

  // Image optimization
  images: {
    lazyLoad: true,
    placeholderColor: 'hsl(var(--muted))',
    fadeInDuration: 300, // ms
  },

  // Request optimization
  requests: {
    batchingEnabled: true,
    batchDelay: 50, // ms
    cacheEnabled: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 1000, // ms
  },

  // Chart optimization
  charts: {
    animationDuration: 300, // ms
    maxDataPoints: {
      mobile: 20,
      tablet: 50,
      desktop: 100,
    },
    debounceResize: 200, // ms
  },

  // Component optimization
  components: {
    memoizationEnabled: true,
    debounceSearch: 300, // ms
    throttleScroll: 100, // ms
  },

  // Mobile optimization
  mobile: {
    reducedAnimations: true,
    simplifedCharts: true,
    lazyLoadTabs: true,
    minTouchTarget: 44, // px (accessibility)
  },

  // Development
  dev: {
    performanceMonitoring: true,
    slowRenderThreshold: 16, // ms (60fps)
    logSlowRenders: true,
  },
} as const;

// Type-safe access
export type PerformanceConfig = typeof performanceConfig;
