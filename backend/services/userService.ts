import { isMailEnabled, sendMail } from '@backend/mail';
import { userRepository } from '@backend/repositories/userRepository';
import { logger, withSpan } from '@backend/telemetry';
import { errorOr } from '@backend/types/errorOr';
import {
  generatePassphrase,
  signAuthToken,
  signSignupToken,
} from '@backend/utils/auth';

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
  ): Promise<
    ErrorOr<
      User & { signupLink: string; mailSent: boolean; mailConfigured: boolean }
    >
  > {
    return withSpan('user.create', { 'user.role': role }, async (span) => {
      const existing = await repo.getByEmail(email);
      if (existing) {
        return errorOr<
          User & {
            signupLink: string;
            mailSent: boolean;
            mailConfigured: boolean;
          }
        >(null, [
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

      const mailConfigured = isMailEnabled();
      let mailSent = false;
      try {
        await sendMail({
          to: email,
          subject: "You've been invited — set your password",
          html: `<p>Hi ${name},</p><p>Your account has been created. Click the link below to set your password:</p><p><a href="${signupLink}">${signupLink}</a></p><p>This link expires in 1 hour.</p>`,
          text: `Hi ${name},\n\nYour account has been created. Set your password at:\n${signupLink}\n\nThis link expires in 1 hour.`,
        });
        mailSent = true;
      } catch (err) {
        logger.warn('📧 Failed to send signup email', {
          email,
          error: String(err),
        });
      }

      span.setAttribute('user.id', safeUser.id ?? '');
      span.setAttribute('mail.configured', mailConfigured);
      span.setAttribute('mail.sent', mailSent);
      logger.info('User created', { userId: safeUser.id ?? '', role });

      return errorOr({ ...safeUser, signupLink, mailSent, mailConfigured });
    });
  },

  async deleteUser(
    id: string,
    requestingUserId: string,
  ): Promise<ErrorOr<null>> {
    return withSpan(
      'user.delete',
      { 'user.id': id, 'actor.user.id': requestingUserId },
      async (_span) => {
        if (id === requestingUserId) {
          return errorOr<null>(null, [
            {
              type: 'forbidden',
              message: 'You cannot delete your own account',
            },
          ]);
        }

        const user = await repo.getById(id);
        if (!user) {
          return errorOr<null>(null, [
            { type: 'not_found', message: 'User not found' },
          ]);
        }

        await repo.deleteById(id);
        logger.info('User deleted', {
          userId: id,
          deletedBy: requestingUserId,
        });
        return errorOr(null);
      },
    );
  },

  async updateUserRole(
    id: string,
    role: 'admin' | 'user',
    requestingUserId: string,
  ): Promise<ErrorOr<User>> {
    return withSpan(
      'user.update_role',
      { 'user.id': id, 'user.role': role, 'actor.user.id': requestingUserId },
      async (_span) => {
        if (id === requestingUserId) {
          return errorOr<User>(null, [
            { type: 'forbidden', message: 'You cannot change your own role' },
          ]);
        }

        const updated = await repo.updateRole(id, role);
        if (!updated) {
          return errorOr<User>(null, [
            { type: 'not_found', message: 'User not found' },
          ]);
        }

        const { password: _password, ...safeUser } = updated;
        logger.info('User role updated', {
          userId: id,
          role,
          updatedBy: requestingUserId,
        });
        return errorOr(safeUser);
      },
    );
  },

  async resetUserPassword(
    id: string,
  ): Promise<
    ErrorOr<{ signupLink: string; mailSent: boolean; mailConfigured: boolean }>
  > {
    return withSpan('user.reset_password', { 'user.id': id }, async (span) => {
      const user = await repo.getById(id);
      if (!user) {
        return errorOr<{
          signupLink: string;
          mailSent: boolean;
          mailConfigured: boolean;
        }>(null, [{ type: 'not_found', message: 'User not found' }]);
      }

      const passphrase = generatePassphrase();
      const hashedPassword = await Bun.password.hash(passphrase);
      await repo.updatePassword(id, hashedPassword);

      const token = await signSignupToken(user.id!, user.email);
      const appUrl = Bun.env.APP_URL ?? 'http://localhost:3000';
      const signupLink = `${appUrl}/set-password?token=${token}`;

      const mailConfigured = isMailEnabled();
      let mailSent = false;
      try {
        await sendMail({
          to: user.email,
          subject: 'Your password has been reset',
          html: `<p>Hi ${user.name},</p><p>An admin has reset your password. Click the link below to set a new one:</p><p><a href="${signupLink}">${signupLink}</a></p><p>This link expires in 1 hour.</p>`,
          text: `Hi ${user.name},\n\nAn admin has reset your password. Set a new one at:\n${signupLink}\n\nThis link expires in 1 hour.`,
        });
        mailSent = true;
      } catch (err) {
        logger.warn('📧 Failed to send password reset email', {
          userId: id,
          error: String(err),
        });
      }

      span.setAttribute('mail.configured', mailConfigured);
      span.setAttribute('mail.sent', mailSent);
      logger.info('User password reset by admin', { userId: id });
      return errorOr({ signupLink, mailSent, mailConfigured });
    });
  },

  async updateUserName(
    id: string,
    name: string,
    requestingUserId: string,
  ): Promise<ErrorOr<{ token: string; user: User }>> {
    return withSpan(
      'user.update_name',
      { 'user.id': id, 'actor.user.id': requestingUserId },
      async (_span) => {
        if (id !== requestingUserId) {
          return errorOr<{ token: string; user: User }>(null, [
            { type: 'forbidden', message: 'You can only change your own name' },
          ]);
        }

        const updated = await repo.updateName(id, name);
        if (!updated) {
          return errorOr<{ token: string; user: User }>(null, [
            { type: 'not_found', message: 'User not found' },
          ]);
        }

        const { password: _password, ...safeUser } = updated;
        const token = await signAuthToken(
          safeUser.id!,
          safeUser.email,
          safeUser.role,
          safeUser.name,
        );

        logger.info('User name updated', { userId: id });
        return errorOr({ token, user: safeUser });
      },
    );
  },
});

/**
 * User Service
 * Handles business logic for user operations
 * Transforms data between repository and handler layers
 */
export const userService = createUserService(userRepository);
