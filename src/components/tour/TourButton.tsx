import { Sparkles } from 'lucide-react';
import { useGuidedTour } from '@/hooks/useGuidedTour';

export const TourButton = () => {
  const { startTour, hasNewUpdates } = useGuidedTour();

  return (
    <button
      onClick={() => startTour('manual-full')}
      className="relative group px-4 py-2 rounded-lg font-medium text-sm
        bg-gradient-to-br from-primary/20 via-primary/10 to-transparent
        backdrop-blur-xl
        border border-primary/30
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_-1px_0_0_rgba(0,0,0,0.1),0_2px_8px_rgba(var(--primary-rgb),0.2)]
        hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),inset_0_-1px_0_0_rgba(0,0,0,0.15),0_4px_16px_rgba(var(--primary-rgb),0.3)]
        hover:border-primary/50
        transition-all duration-300 ease-out
        hover:scale-[1.02]
        flex items-center gap-2"
      aria-label="Explorar TD"
    >
      <Sparkles className="h-4 w-4 text-primary" />
      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-semibold">
        Explorar TD
      </span>
      {hasNewUpdates && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-glow"></span>
        </span>
      )}
    </button>
  );
};
