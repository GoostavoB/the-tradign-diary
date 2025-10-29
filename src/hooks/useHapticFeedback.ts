import { useCallback } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy';

/**
 * Provides haptic feedback for supported devices
 * Gracefully degrades on unsupported devices
 */
export const useHapticFeedback = () => {
  const vibrate = useCallback((intensity: HapticIntensity = 'medium') => {
    // Check if device supports vibration
    if (!('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
    };

    try {
      navigator.vibrate(patterns[intensity]);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }, []);

  const success = useCallback(() => {
    vibrate('light');
  }, [vibrate]);

  const warning = useCallback(() => {
    vibrate('medium');
  }, [vibrate]);

  const error = useCallback(() => {
    if (!('vibrate' in navigator)) return;
    try {
      // Double vibration for errors
      navigator.vibrate([30, 100, 30]);
    } catch (err) {
      console.warn('Haptic feedback not available:', err);
    }
  }, []);

  const selection = useCallback(() => {
    vibrate('light');
  }, [vibrate]);

  return {
    vibrate,
    success,
    warning,
    error,
    selection,
  };
};
