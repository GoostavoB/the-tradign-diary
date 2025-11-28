import { useEffect, useState } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface PerformanceMetrics {
  cls: number | null;
  inp: number | null;
  fcp: number | null;
  lcp: number | null;
  ttfb: number | null;
}

interface PerformanceThresholds {
  good: number;
  needsImprovement: number;
}

const thresholds: Record<keyof PerformanceMetrics, PerformanceThresholds> = {
  cls: { good: 0.1, needsImprovement: 0.25 },
  inp: { good: 200, needsImprovement: 500 },
  fcp: { good: 1800, needsImprovement: 3000 },
  lcp: { good: 2500, needsImprovement: 4000 },
  ttfb: { good: 800, needsImprovement: 1800 },
};

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cls: null,
    inp: null,
    fcp: null,
    lcp: null,
    ttfb: null,
  });

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      setMetrics((prev) => ({
        ...prev,
        [metric.name.toLowerCase()]: metric.value,
      }));
    };

    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  const getStatus = (metricName: keyof PerformanceMetrics, value: number | null) => {
    if (value === null) return 'loading';
    const threshold = thresholds[metricName];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  };

  return { metrics, getStatus, thresholds };
};
