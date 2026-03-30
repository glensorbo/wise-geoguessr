import { refreshTokens } from '@backend/db/schemas/refreshTokens';

export type RefreshToken = typeof refreshTokens.$inferSelect;
