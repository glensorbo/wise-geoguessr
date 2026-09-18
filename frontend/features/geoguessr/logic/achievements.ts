import { isPlayedScore } from './scores';

import type { GameResult } from './types';

type AchievementId =
  | 'first-blood'
  | 'on-fire'
  | 'unstoppable'
  | 'comeback-kid'
  | 'sniper'
  | 'century-club'
  | 'half-time-hero'
  | 'silver-fox'
  | 'consistent-ace';

export type Achievement = {
  id: AchievementId;
  emoji: string;
  name: string;
  /** Shown in the tooltip when earned. */
  description: string;
  /** Shown in the tooltip when not yet earned. */
  hint: string;
  earned: boolean;
};

const ACHIEVEMENT_DEFS: Omit<Achievement, 'earned'>[] = [
  {
    id: 'first-blood',
    emoji: '🩸',
    name: 'First Blood',
    description: 'Won the very first round they ever played.',
    hint: 'Win the very first round you play.',
  },
  {
    id: 'on-fire',
    emoji: '🔥',
    name: 'On Fire',
    description: 'Achieved a 5-round win streak.',
    hint: 'Win 5 consecutive rounds.',
  },
  {
    id: 'unstoppable',
    emoji: '⚡',
    name: 'Unstoppable',
    description: 'Achieved a 10-round win streak.',
    hint: 'Win 10 consecutive rounds.',
  },
  {
    id: 'comeback-kid',
    emoji: '🔄',
    name: 'Comeback Kid',
    description: 'Went from last place in one round to first in the next.',
    hint: 'Finish last in one round, then win the very next round.',
  },
  {
    id: 'sniper',
    emoji: '🎯',
    name: 'Sniper',
    description: 'Scored 9,000 or more in a single round.',
    hint: 'Reach a score of 9,000+ in any single round.',
  },
  {
    id: 'century-club',
    emoji: '💯',
    name: 'Century Club',
    description: 'Participated in 100 rounds or more.',
    hint: 'Play in 100 or more rounds.',
  },
  {
    id: 'half-time-hero',
    emoji: '👑',
    name: 'Half-time Hero',
    description: 'Maintained a win rate above 50% across at least 10 rounds.',
    hint: 'Win more than 50% of your rounds (minimum 10 played).',
  },
  {
    id: 'silver-fox',
    emoji: '🥈',
    name: 'Silver Fox',
    description: 'Finished in second place 10 or more times.',
    hint: 'Rack up 10 runner-up finishes.',
  },
  {
    id: 'consistent-ace',
    emoji: '📈',
    name: 'Consistent Ace',
    description: 'Kept an average score above 7,500 across at least 10 rounds.',
    hint: 'Maintain an average score above 7,500 over at least 10 rounds.',
  },
];

export const getPlayerAchievements = (
  results: GameResult[],
  playerName: string,
): Achievement[] => {
  const sorted = results.toSorted((a, b) => a.date.localeCompare(b.date));

  // Rounds this player participated in, in order
  const playerRounds = sorted.filter((r) =>
    isPlayedScore(r.scores[playerName]),
  );

  let roundsPlayed = 0;
  let wins = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  let runnerUpFinishes = 0;
  let totalPoints = 0;
  let wonFirst = false;
  let maxScore = 0;
  let hasComeback = false;

  for (let i = 0; i < playerRounds.length; i++) {
    const result = playerRounds[i];
    if (!result) {
      continue;
    }
    const score = result.scores[playerName]!;

    roundsPlayed++;
    totalPoints += score;

    if (score > maxScore) {
      maxScore = score;
    }

    const allScores = Object.values(result.scores).filter(isPlayedScore);
    const winnerScore = Math.max(...allScores);
    const isWinner = score === winnerScore;

    // Runner-up: player has the second-highest score (not winner)
    const sortedDesc = allScores.toSorted((a, b) => b - a);
    const secondScore = sortedDesc.find((s) => s < winnerScore);
    if (!isWinner && secondScore !== undefined && score === secondScore) {
      runnerUpFinishes++;
    }

    if (isWinner) {
      wins++;
      if (roundsPlayed === 1) {
        wonFirst = true;
      }
      currentStreak++;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }

    // Comeback Kid: last place in previous round → winner this round
    if (i > 0 && isWinner) {
      const prev = playerRounds[i - 1];
      if (prev) {
        const prevScore = prev.scores[playerName]!;
        const prevAllScores = Object.values(prev.scores).filter(isPlayedScore);
        const prevMin = Math.min(...prevAllScores);
        if (prevScore === prevMin) {
          hasComeback = true;
        }
      }
    }
  }

  const winRate = roundsPlayed >= 10 ? wins / roundsPlayed : 0;
  const avgScore = roundsPlayed >= 10 ? totalPoints / roundsPlayed : 0;

  const earned: Record<AchievementId, boolean> = {
    'first-blood': wonFirst,
    'on-fire': bestStreak >= 5,
    unstoppable: bestStreak >= 10,
    'comeback-kid': hasComeback,
    sniper: maxScore >= 9000,
    'century-club': roundsPlayed >= 100,
    'half-time-hero': roundsPlayed >= 10 && winRate > 0.5,
    'silver-fox': runnerUpFinishes >= 10,
    'consistent-ace': roundsPlayed >= 10 && avgScore > 7500,
  };

  return ACHIEVEMENT_DEFS.map((def) => ({
    ...def,
    earned: earned[def.id],
  }));
};
