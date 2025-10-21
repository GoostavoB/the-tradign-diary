import { useCallback } from 'react';
import { useCalmMode } from '@/contexts/CalmModeContext';

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [20, 100, 20],
  error: [50, 100, 50],
};

export const useHapticFeedback = () => {
  const { calmModeEnabled } = useCalmMode();

  const triggerHaptic = useCallback((pattern: HapticPattern = 'light') => {
    if (calmModeEnabled) return;
    if (!('vibrate' in navigator)) return;

    try {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }, [calmModeEnabled]);

  const hapticForEvent = useCallback((eventType: string) => {
    const eventPatterns: Record<string, HapticPattern> = {
      xp_gain: 'light',
      level_up: 'success',
      badge_unlock: 'medium',
      achievement_unlock: 'heavy',
      challenge_complete: 'success',
      trade_win: 'medium',
      trade_loss: 'light',
      error: 'error',
      warning: 'warning',
    };

    const pattern = eventPatterns[eventType] || 'light';
    triggerHaptic(pattern);
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    hapticForEvent,
  };
};
