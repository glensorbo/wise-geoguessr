import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';

import { getDb } from '../db/client';
import { users } from '../db/schemas/users';

import type { NewUser } from '@backend/types/newUser';

/**
 * User Repository
 * Handles all database operations for users
 * Pure data access layer - no business logic
 */
export const userRepository = {
  /**
   * Get all users from the database
   * @returns Promise<User[]> - Array of all users including password field
   */
  async getAll(): Promise<NewUser[]> {
    const db = getDb();
    return await db.select().from(users);
  },

  /**
   * Get a single user by ID
   * @param id - User ID (UUID)
   * @returns Promise<User | undefined> - User if found, undefined otherwise
   */
  async getById(id: string): Promise<NewUser | undefined> {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  },

  /**
   * Get a user by email
   * @param email - User email address
   * @returns Promise<User | undefined> - User if found, undefined otherwise
   */
  async getByEmail(email: string): Promise<NewUser | undefined> {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  },

  /**
   * Create a new user
   * @param email - User email address
   * @param name - Display name
   * @param hashedPassword - Pre-hashed password
   * @param role - User role (defaults to 'user')
   * @returns Promise<NewUser> - The created user
   */
  async create(
    email: string,
    name: string,
    hashedPassword: string,
    role: 'admin' | 'user' = 'user',
  ): Promise<NewUser> {
    const db = getDb();
    const result = await db
      .insert(users)
      .values({ email, name, password: hashedPassword, role })
      .returning();
    return result[0]!;
  },

  /**
   * Update a user's password
   * @param id - User ID (UUID)
   * @param hashedPassword - Pre-hashed new password
   */
  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const db = getDb();
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: dayjs().toISOString() })
      .where(eq(users.id, id));
  },

  async updateRole(
    id: string,
    role: 'admin' | 'user',
  ): Promise<NewUser | undefined> {
    const db = getDb();
    const result = await db
      .update(users)
      .set({ role, updatedAt: dayjs().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  },

  async deleteById(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return result.length > 0;
  },
};
