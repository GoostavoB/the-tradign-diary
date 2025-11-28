import { useState, useCallback } from 'react';

export const useTriggerConfetti = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return { showConfetti, triggerConfetti };
};
