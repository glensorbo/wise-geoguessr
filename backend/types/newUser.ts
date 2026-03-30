import { users } from '@backend/db/schemas/users';

export type NewUser = typeof users.$inferSelect;
