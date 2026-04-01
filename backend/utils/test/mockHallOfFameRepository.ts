import type { hallOfFameRepository } from '@backend/repositories/hallOfFameRepository';
import type { HallOfFame } from '@backend/types/hallOfFame';

const mockData: HallOfFame = {
  highestSingleRoundScore: {
    score: 20323,
    holders: [{ playerName: 'Malin', date: '2026-03-13' }],
  },
  longestWinStreak: {
    streak: 2,
    holders: [
      {
        playerName: 'Malin',
        startDate: '2025-12-19',
        endDate: '2026-03-13',
      },
    ],
  },
  highestSeasonTotal: {
    total: 51422,
    holders: [{ playerName: 'Glen', year: 2026 }],
  },
  mostRoundsPlayed: {
    rounds: 12,
    holders: [{ playerName: 'Glen' }],
  },
  highestAverageScore: {
    average: 14500,
    holders: [{ playerName: 'Malin' }],
  },
  mostRunnerUpFinishes: {
    count: 4,
    holders: [{ playerName: 'Thomas' }],
  },
  allTimePointsLeader: {
    total: 234567,
    holders: [{ playerName: 'Glen' }],
  },
  highestWinRate: {
    winRate: 66.7,
    holders: [{ playerName: 'Malin' }],
  },
  biggestWinningMargin: {
    margin: 8500,
    holders: [{ playerName: 'Malin', date: '2026-03-13' }],
  },
};

export const mockHallOfFameRepository: typeof hallOfFameRepository = {
  async getHallOfFame() {
    return mockData;
  },
};
