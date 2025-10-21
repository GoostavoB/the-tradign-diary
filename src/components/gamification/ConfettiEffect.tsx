import { useEffect, useState } from 'react';
import { Confetti } from './Confetti';

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const ConfettiEffect = ({ trigger, onComplete }: ConfettiEffectProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return show ? <Confetti active={show} /> : null;
};
