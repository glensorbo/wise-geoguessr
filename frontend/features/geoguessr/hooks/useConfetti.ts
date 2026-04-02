import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

export const useConfetti = (shouldFire: boolean, delayMs = 0) => {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (!shouldFire || hasTriggered.current) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    hasTriggered.current = true;

    const timer = setTimeout(() => {
      void confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.55 },
      });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [shouldFire, delayMs]);
};
