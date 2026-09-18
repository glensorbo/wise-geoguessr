import { hallOfFameService } from '@backend/services/hallOfFameService';
import { successResponse } from '@backend/utils/response';

import type { hallOfFameService as HallOfFameServiceType } from '@backend/services/hallOfFameService';

export const createHallOfFameController = (
  service: typeof HallOfFameServiceType,
) => ({
  async getHallOfFame(): Promise<Response> {
    const data = await service.getHallOfFame();
    return successResponse(data);
  },
});

export const hallOfFameController =
  createHallOfFameController(hallOfFameService);
