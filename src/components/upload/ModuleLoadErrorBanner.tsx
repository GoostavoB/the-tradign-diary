import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const ModuleLoadErrorBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Failed to load module script') || 
          event.message?.includes('Failed to fetch dynamically imported module')) {
        console.error('[Module Load Error] Detected:', event.message);
        setShowBanner(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleReload = () => {
    // Add cache-bypass parameter and reload (triggers deep cleanup)
    const url = new URL(window.location.href);
    url.searchParams.set('clear-cache', '1');
    window.location.href = url.toString();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4">
      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/90 shadow-lg">
        <div className="flex items-start gap-3 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              App Loading Issue Detected
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Some files failed to load. Click below to reload with cache bypass.
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleReload}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload & Fix
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowBanner(false)}
                className="text-amber-900 dark:text-amber-100"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowBanner(false)}
            className="flex-shrink-0 h-6 w-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
