/**
 * Web Vitals monitoring
 * Tracks Core Web Vitals for performance monitoring
 */

interface VitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

type VitalsCallback = (metric: VitalsMetric) => void;

/**
 * Report Web Vitals metrics
 */
export const reportWebVitals = (onPerfEntry?: VitalsCallback) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Use dynamic import to reduce bundle size
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry); // INP replaced FID in web-vitals v3+
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    }).catch(() => {
      // web-vitals not available, silent fail
    });
  }
};

/**
 * Get rating thresholds for metrics
 */
const getThresholds = (name: string): { good: number; poor: number } => {
  switch (name) {
    case 'CLS':
      return { good: 0.1, poor: 0.25 };
    case 'INP':
      return { good: 200, poor: 500 };
    case 'FCP':
      return { good: 1800, poor: 3000 };
    case 'LCP':
      return { good: 2500, poor: 4000 };
    case 'TTFB':
      return { good: 800, poor: 1800 };
    default:
      return { good: 0, poor: 0 };
  }
};

/**
 * Calculate rating based on value
 */
export const getRating = (name: string, value: number): VitalsMetric['rating'] => {
  const thresholds = getThresholds(name);
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

/**
 * Log vitals to console in development
 */
export const logVitals = (metric: VitalsMetric) => {
  if (import.meta.env.DEV) {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} ${metric.name}:`,
      `${metric.value.toFixed(2)}ms`,
      `(${metric.rating})`
    );
  }
};

/**
 * Send vitals to analytics (placeholder for future implementation)
 */
export const sendVitalsToAnalytics = (metric: VitalsMetric) => {
  // In production, send to your analytics service
  // Example: analytics.track('web-vital', metric);
  
  if (import.meta.env.DEV) {
    logVitals(metric);
  }
};
