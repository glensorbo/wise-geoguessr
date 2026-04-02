import confetti from 'canvas-confetti';
import { useCallback } from 'react';

// Module-level Set: persists until page reload, survives component re-mounts.
// This ensures confetti fires at most once per key per page visit.
const fired = new Set<string>();

export const useConfetti = (key: string) => {
  return useCallback(() => {
    if (fired.has(key)) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fired.add(key);
      return;
    }
    fired.add(key);
    void confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
  }, [key]);
};
