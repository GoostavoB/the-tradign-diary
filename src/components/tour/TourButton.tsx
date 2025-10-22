import { Button } from '@/components/ui/button';
import { useGuidedTour } from '@/hooks/useGuidedTour';

export const TourButton = () => {
  const { startTour, hasNewUpdates } = useGuidedTour();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => startTour('manual-full')}
      className="relative font-medium"
      aria-label="Explorar TD"
    >
      Explorar TD
      {hasNewUpdates && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      )}
    </Button>
  );
};
