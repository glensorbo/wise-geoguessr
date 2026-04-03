import { userRepository } from '@backend/repositories/userRepository';
import { logger, withSpan } from '@backend/telemetry';
import { errorOr } from '@backend/types/errorOr';

import type { userRepository as UserRepositoryType } from '@backend/repositories/userRepository';
import type { ErrorOr } from '@backend/types/errorOr';
import type { User } from '@backend/types/user';

/**
 * User Service Factory
 * Accepts repository as dependency for testability
 */
export const createUserService = (repo: typeof UserRepositoryType) => ({
  async getAllUsers(): Promise<User[]> {
    const users = await repo.getAll();
    return users.map(({ password: _password, ...safeUser }) => safeUser);
  },

  async getUserById(id: string): Promise<User | undefined> {
    const user = await repo.getById(id);
    if (!user) {
      return undefined;
    }
    const { password: _password, ...safeUser } = user;
    return safeUser;
  },

  async createUser(
    email: string,
    name: string,
    password: string,
    role: 'admin' | 'user',
  ): Promise<ErrorOr<User>> {
    return withSpan('user.create', { 'user.role': role }, async (span) => {
      const existing = await repo.getByEmail(email);
      if (existing) {
        return errorOr<User>(null, [
          {
            type: 'conflict',
            message: 'A user with this email already exists',
            field: 'email',
          },
        ]);
      }

      const hashedPassword = await Bun.password.hash(password);
      const user = await repo.create(email, name, hashedPassword, role);
      const { password: _password, ...safeUser } = user;

      span.setAttribute('user.id', safeUser.id ?? '');
      logger.info('User created', { userId: safeUser.id ?? '', role });

      return errorOr(safeUser);
    });
  },
});

/**
 * User Service
 * Handles business logic for user operations
 * Transforms data between repository and handler layers
 */
export const userService = createUserService(userRepository);
