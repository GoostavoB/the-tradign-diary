import { useState } from 'react';
import { Compass, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useGuidedTour } from '@/hooks/useGuidedTour';

export const TourCTAButton = () => {
  const { shouldShowTour, hasNewUpdates, startTour, loading } = useGuidedTour();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if dismissed, loading, or no reason to show
  if (loading || isDismissed || (!shouldShowTour && !hasNewUpdates)) {
    return null;
  }

  const handleStartTour = () => {
    if (hasNewUpdates) {
      startTour('manual-updates');
    } else {
      startTour('manual-full');
    }
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const isFirstTime = shouldShowTour && !hasNewUpdates;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed bottom-20 right-6 z-50 md:bottom-6 md:right-6"
      >
        <GlassCard
          variant="default"
          className="relative w-[280px] p-4 shadow-elegant border-border/30"
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-accent/10 transition-colors"
            aria-label="Dispensar"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Badge for new updates */}
          {hasNewUpdates && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -left-2"
            >
              <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full shadow-glow">
                Novo
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className="space-y-3">
            {/* Icon and Title */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                {isFirstTime ? (
                  <Compass className="w-5 h-5 text-primary" />
                ) : (
                  <Sparkles className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-foreground leading-tight">
                  {isFirstTime ? 'Conheça o TD' : 'Novidades Disponíveis'}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isFirstTime
                    ? 'Tour guiado pela plataforma'
                    : 'Descubra as atualizações'}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleStartTour}
              className="w-full h-9 text-sm font-normal hover:scale-[1.02] transition-transform"
              variant="default"
            >
              {isFirstTime ? 'Iniciar Tour' : 'Ver Novidades'}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
};
