export const isPlayedScore = (score: number | undefined): score is number => {
  return typeof score === 'number' && score > 0;
};
