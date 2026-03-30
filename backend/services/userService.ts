import { userRepository } from '@backend/repositories/userRepository';

import type { userRepository as UserRepositoryType } from '@backend/repositories/userRepository';
import type { User } from '@backend/types/user';

/**
 * User Service Factory
 * Accepts repository as dependency for testability
 */
export const createUserService = (repo: typeof UserRepositoryType) => ({
  /**
   * Get all users with safe data (password omitted)
   * @returns Promise<User[]> - Array of users without password field
   */
  async getAllUsers(): Promise<User[]> {
    const users = await repo.getAll();

    // Transform User[] to SafeUser[] by omitting password
    return users.map(({ password: _password, ...safeUser }) => safeUser);
  },

  /**
   * Get a single user by ID
   * @param id - User ID (UUID)
   * @returns Promise<User | undefined> - User if found, undefined otherwise
   */
  async getUserById(id: string): Promise<User | undefined> {
    const user = await repo.getById(id);

    if (!user) {
      return undefined;
    }

    // Omit password from response
    const { password: _password, ...safeUser } = user;
    return safeUser;
  },
});

/**
 * User Service
 * Handles business logic for user operations
 * Transforms data between repository and handler layers
 */
export const userService = createUserService(userRepository);
