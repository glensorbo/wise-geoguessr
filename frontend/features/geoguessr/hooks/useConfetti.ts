import confetti from 'canvas-confetti';

export const fireConfetti = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  void confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
};
