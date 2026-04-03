import { isMailEnabled, sendMail } from '@backend/mail';
import { userRepository } from '@backend/repositories/userRepository';
import { logger, withSpan } from '@backend/telemetry';
import { errorOr } from '@backend/types/errorOr';
import { generatePassphrase, signSignupToken } from '@backend/utils/auth';

import type { userRepository as UserRepositoryType } from '@backend/repositories/userRepository';
import type { ErrorOr } from '@backend/types/errorOr';
import type { User } from '@backend/types/user';

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
    role: 'admin' | 'user',
  ): Promise<ErrorOr<User & { signupLink: string; mailSent: boolean }>> {
    return withSpan('user.create', { 'user.role': role }, async (span) => {
      const existing = await repo.getByEmail(email);
      if (existing) {
        return errorOr<User & { signupLink: string; mailSent: boolean }>(null, [
          {
            type: 'conflict',
            message: 'A user with this email already exists',
            field: 'email',
          },
        ]);
      }

      const passphrase = generatePassphrase();
      const hashedPassword = await Bun.password.hash(passphrase);
      const user = await repo.create(email, name, hashedPassword, role);
      const { password: _password, ...safeUser } = user;

      const token = await signSignupToken(safeUser.id!, email);
      const appUrl = Bun.env.APP_URL ?? 'http://localhost:3000';
      const signupLink = `${appUrl}/set-password?token=${token}`;

      let mailSent = false;
      try {
        await sendMail({
          to: email,
          subject: "You've been invited — set your password",
          html: `<p>Hi ${name},</p><p>Your account has been created. Click the link below to set your password:</p><p><a href="${signupLink}">${signupLink}</a></p><p>This link expires in 1 hour.</p>`,
          text: `Hi ${name},\n\nYour account has been created. Set your password at:\n${signupLink}\n\nThis link expires in 1 hour.`,
        });
        mailSent = isMailEnabled();
      } catch (err) {
        logger.warn('📧 Failed to send signup email', {
          email,
          error: String(err),
        });
      }

      span.setAttribute('user.id', safeUser.id ?? '');
      logger.info('User created', { userId: safeUser.id ?? '', role });

      return errorOr({ ...safeUser, signupLink, mailSent });
    });
  },
});

/**
 * User Service
 * Handles business logic for user operations
 * Transforms data between repository and handler layers
 */
export const userService = createUserService(userRepository);
