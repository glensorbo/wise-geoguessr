export type GameResult = {
  id: string;
  date: string;
  gameLink: string | null;
  scores: Record<string, number>;
};
