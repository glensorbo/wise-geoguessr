import confetti from 'canvas-confetti';
import { useCallback } from 'react';

export const useConfetti = () => {
  return useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    void confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
  }, []);
};
