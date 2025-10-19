import { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Development-only performance monitor
 * Displays real-time performance metrics
 */
const PerformanceMonitorComponent = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    // FPS monitoring
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    const rafId = requestAnimationFrame(measureFPS);

    // Memory monitoring (if available)
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        console.log(`Memory: ${usedMB}MB / ${totalMB}MB`);
      }
    };

    const memoryInterval = setInterval(checkMemory, 5000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(memoryInterval);
    };
  }, []);

  useEffect(() => {
    // Listen for web vitals
    const handleVitals = (event: CustomEvent) => {
      const { name, value, rating } = event.detail;
      setMetrics(prev => {
        const filtered = prev.filter(m => m.name !== name);
        return [...filtered, { name, value, rating }].slice(-5);
      });
    };

    window.addEventListener('web-vitals' as any, handleVitals);
    return () => window.removeEventListener('web-vitals' as any, handleVitals);
  }, []);

  if (!import.meta.env.DEV) return null;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'needs-improvement': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'poor': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return '';
    }
  };

  const getFpsColor = () => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="gap-2 glass-strong shadow-lg"
          aria-label="Show performance monitor"
        >
          <Activity className="h-4 w-4" />
          Performance
        </Button>
      ) : (
        <Card className="glass-strong w-80 shadow-2xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Performance Monitor
              </CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                aria-label="Hide performance monitor"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* FPS */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">FPS</span>
              </div>
              <span className={`text-lg font-bold ${getFpsColor()}`}>
                {fps}
              </span>
            </div>

            {/* Web Vitals */}
            {metrics.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Web Vitals</p>
                {metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="text-xs font-medium">{metric.name}</span>
                    <Badge variant="outline" className={getRatingColor(metric.rating)}>
                      {metric.value.toFixed(0)}ms
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                React {import.meta.env.DEV ? 'Development' : 'Production'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const PerformanceMonitor = memo(PerformanceMonitorComponent);
