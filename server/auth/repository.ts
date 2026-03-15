import { eq } from 'drizzle-orm';

import { getDatabase } from '../db/client';
import { users } from '../db/schemas';
import { hashPassword, normalizeEmail } from './users';

const baseUserSelection = {
  id: users.id,
  email: users.email,
  passwordHash: users.passwordHash,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const findUserByEmail = async (email: string) => {
  const [user] = await getDatabase()
    .select(baseUserSelection)
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);

  return user ?? null;
};

export const upsertUserWithPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await hashPassword(password);
  const [user] = await getDatabase()
    .insert(users)
    .values({
      email: normalizedEmail,
      passwordHash,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash,
        updatedAt: new Date(),
      },
    })
    .returning(baseUserSelection);

  if (user == null) {
    throw new Error('Failed to create or update the seed user.');
  }

  return user;
};
