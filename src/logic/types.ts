export type Player = string;

export type GameResult = {
  date: string;
  scores: Record<Player, number>;
};

export type PlayerSeriesRow = {
  date: string;
  winners: Player[];
} & Record<string, string | number | Player[] | undefined>;

export type PlayerPointTotal = {
  name: Player;
  date: string;
  total: number;
};

export type PlayerDetail = {
  name: Player;
  played: number;
  won: number;
  points: PlayerPointTotal[];
};

export type CumulativePointsRow = Record<string, string | number>;

export type PerPlayedRoundDetail = {
  name: Player;
  pointsPerPlayed: number;
  roundsPlayed: number;
  totalPoints: number;
};
