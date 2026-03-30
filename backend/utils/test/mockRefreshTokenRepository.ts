import type { RefreshToken } from '@backend/types/refreshToken';

let store: RefreshToken[] = [];

export const mockRefreshTokenRepository = {
  create: async (userId: string, tokenHash: string): Promise<RefreshToken> => {
    const record: RefreshToken = {
      id: crypto.randomUUID(),
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    store.push(record);
    return record;
  },

  getByTokenHash: async (
    tokenHash: string,
  ): Promise<RefreshToken | undefined> => {
    return store.find((r) => r.tokenHash === tokenHash);
  },

  deleteById: async (id: string): Promise<void> => {
    store = store.filter((r) => r.id !== id);
  },

  deleteByUserId: async (userId: string): Promise<void> => {
    store = store.filter((r) => r.userId !== userId);
  },

  /** Reset between tests */
  _reset: () => {
    store = [];
  },
};
