export type HighestScoreHolder = {
  playerName: string;
  date: string; // YYYY-MM-DD
};

export type WinStreakHolder = {
  playerName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

export type SeasonTotalHolder = {
  playerName: string;
  year: number;
};

export type HonorableMentionHolder = {
  playerName: string;
};

export type MarginHolder = {
  playerName: string;
  date: string; // YYYY-MM-DD — the round it happened
};

export type HallOfFame = {
  highestSingleRoundScore: {
    score: number;
    holders: HighestScoreHolder[];
  } | null;
  longestWinStreak: {
    streak: number;
    holders: WinStreakHolder[];
  } | null;
  highestSeasonTotal: {
    total: number;
    holders: SeasonTotalHolder[];
  } | null;
  /** Most rounds participated in across all time */
  mostRoundsPlayed: {
    rounds: number;
    holders: HonorableMentionHolder[];
  } | null;
  /** Highest average score per round (minimum 3 rounds to qualify) */
  highestAverageScore: {
    average: number;
    holders: HonorableMentionHolder[];
  } | null;
  /** Most runner-up (2nd place) finishes */
  mostRunnerUpFinishes: {
    count: number;
    holders: HonorableMentionHolder[];
  } | null;
  /** Highest total points accumulated across all seasons */
  allTimePointsLeader: {
    total: number;
    holders: HonorableMentionHolder[];
  } | null;
  /** Highest win rate — wins / rounds played (minimum 5 rounds to qualify) */
  highestWinRate: {
    winRate: number; // percentage, one decimal place e.g. 75.0
    holders: HonorableMentionHolder[];
  } | null;
  /** Largest gap between 1st and 2nd place in a single round */
  biggestWinningMargin: {
    margin: number;
    holders: MarginHolder[];
  } | null;
};
