import { hallOfFameRepository } from '@backend/repositories/hallOfFameRepository';

import type { hallOfFameRepository as HallOfFameRepositoryType } from '@backend/repositories/hallOfFameRepository';
import type { HallOfFame } from '@backend/types/hallOfFame';

export const createHallOfFameService = (
  repo: typeof HallOfFameRepositoryType,
) => ({
  async getHallOfFame(): Promise<HallOfFame> {
    return repo.getHallOfFame();
  },
});

export const hallOfFameService = createHallOfFameService(hallOfFameRepository);
