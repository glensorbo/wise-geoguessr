import { sendMail } from '@backend/mail';
import { refreshTokenRepository } from '@backend/repositories/refreshTokenRepository';
import { userRepository } from '@backend/repositories/userRepository';
import { logger } from '@backend/telemetry';
import { errorOr } from '@backend/types/errorOr';
import {
  generateRefreshToken,
  hashRefreshToken,
  generatePassphrase,
  signAuthToken,
  signSignupToken,
} from '@backend/utils/auth';

import type { refreshTokenRepository as RefreshTokenRepositoryType } from '@backend/repositories/refreshTokenRepository';
import type { userRepository as UserRepositoryType } from '@backend/repositories/userRepository';
import type { ErrorOr } from '@backend/types/errorOr';

/**
 * Auth Service Factory
 * Accepts repositories as dependencies for testability.
 */
export const createAuthService = (
  repo: typeof UserRepositoryType,
  refreshRepo: typeof RefreshTokenRepositoryType,
) => ({
  /**
   * Create a new user and return a signup link containing a short-lived JWT.
   * The caller (an authenticated user) provides email + name.
   * A passphrase is auto-generated and hashed as the initial password.
   */
  async createUser(
    email: string,
    name: string,
  ): Promise<ErrorOr<{ signupLink: string }>> {
    const existing = await repo.getByEmail(email);

    if (existing) {
      return errorOr<{ signupLink: string }>(null, [
        {
          type: 'conflict',
          message: 'A user with this email already exists',
          field: 'email',
        },
      ]);
    }

    const passphrase = generatePassphrase();
    const hashedPassword = await Bun.password.hash(passphrase);
    const user = await repo.create(email, name, hashedPassword);
    const token = await signSignupToken(user.id!, email);
    const appUrl = Bun.env.APP_URL ?? 'http://localhost:3000';

    const signupLink = `${appUrl}/set-password?token=${token}`;

    try {
      await sendMail({
        to: email,
        subject: "You've been invited — set your password",
        html: `<p>Hi ${name},</p><p>Your account has been created. Click the link below to set your password:</p><p><a href="${signupLink}">${signupLink}</a></p><p>This link expires in 1 hour.</p>`,
        text: `Hi ${name},\n\nYour account has been created. Set your password at:\n${signupLink}\n\nThis link expires in 1 hour.`,
      });
    } catch (err) {
      logger.warn('📧 Failed to send signup email', {
        email,
        error: String(err),
      });
    }

    return errorOr({ signupLink });
  },

  /**
   * Verify email + password and return a short-lived access token plus a
   * raw refresh token. The refresh token should be set as an HttpOnly cookie
   * by the controller — only the access token goes in the response body.
   *
   * Returns the same error for both wrong email and wrong password
   * to prevent user enumeration.
   */
  async login(
    email: string,
    password: string,
  ): Promise<ErrorOr<{ token: string; refreshToken: string }>> {
    const invalidError = errorOr<{ token: string; refreshToken: string }>(
      null,
      [{ type: 'unauthorized', message: 'Invalid email or password' }],
    );

    const user = await repo.getByEmail(email);
    if (!user) {
      return invalidError;
    }

    const passwordMatch = await Bun.password.verify(password, user.password);
    if (!passwordMatch) {
      return invalidError;
    }

    const token = await signAuthToken(
      user.id!,
      user.email,
      user.role,
      user.name,
    );
    const refreshToken = generateRefreshToken();
    const tokenHash = await hashRefreshToken(refreshToken);
    await refreshRepo.create(user.id!, tokenHash);

    return errorOr({ token, refreshToken });
  },

  /**
   * Set a new password for a user (used during onboarding via signup link).
   * Issues a new access token and refresh token on success.
   */
  async setPassword(
    userId: string,
    password: string,
  ): Promise<ErrorOr<{ token: string; refreshToken: string }>> {
    const user = await repo.getById(userId);
    if (!user) {
      return errorOr<{ token: string; refreshToken: string }>(null, [
        { type: 'not_found', message: 'No user found with this ID' },
      ]);
    }

    const hashedPassword = await Bun.password.hash(password);
    await repo.updatePassword(userId, hashedPassword);

    const token = await signAuthToken(userId, user.email, user.role, user.name);
    const refreshToken = generateRefreshToken();
    const tokenHash = await hashRefreshToken(refreshToken);
    await refreshRepo.create(userId, tokenHash);

    return errorOr({ token, refreshToken });
  },

  /**
   * Change password for an authenticated user.
   * Verifies the current password before updating to the new one.
   * Issues fresh access and refresh tokens on success.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<ErrorOr<{ token: string; refreshToken: string }>> {
    const user = await repo.getById(userId);
    if (!user) {
      return errorOr<{ token: string; refreshToken: string }>(null, [
        { type: 'not_found', message: 'No user found with this ID' },
      ]);
    }

    const passwordMatch = await Bun.password.verify(
      currentPassword,
      user.password,
    );
    if (!passwordMatch) {
      return errorOr<{ token: string; refreshToken: string }>(null, [
        {
          type: 'unauthorized',
          message: 'Current password is incorrect',
          field: 'currentPassword',
        },
      ]);
    }

    const hashedPassword = await Bun.password.hash(newPassword);
    await repo.updatePassword(userId, hashedPassword);

    const token = await signAuthToken(userId, user.email, user.role, user.name);
    const refreshToken = generateRefreshToken();
    const tokenHash = await hashRefreshToken(refreshToken);
    await refreshRepo.create(userId, tokenHash);

    return errorOr({ token, refreshToken });
  },

  /**
   * Rotates the refresh token on every use — the old one is deleted and a
   * fresh one is issued. Returns both so the controller can update the cookie.
   */
  async refresh(
    rawRefreshToken: string,
  ): Promise<ErrorOr<{ token: string; refreshToken: string }>> {
    const invalidError = errorOr<{ token: string; refreshToken: string }>(
      null,
      [{ type: 'unauthorized', message: 'Invalid or expired refresh token' }],
    );

    const tokenHash = await hashRefreshToken(rawRefreshToken);
    const stored = await refreshRepo.getByTokenHash(tokenHash);

    if (!stored) {
      return invalidError;
    }

    const now = new Date();
    if (new Date(stored.expiresAt) < now) {
      await refreshRepo.deleteById(stored.id);
      return invalidError;
    }

    const user = await repo.getById(stored.userId);
    if (!user) {
      return invalidError;
    }

    // Rotate — delete the consumed token and issue a fresh one
    await refreshRepo.deleteById(stored.id);

    const token = await signAuthToken(
      user.id!,
      user.email,
      user.role,
      user.name,
    );
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = await hashRefreshToken(newRefreshToken);
    await refreshRepo.create(user.id!, newTokenHash);

    return errorOr({ token, refreshToken: newRefreshToken });
  },

  /**
   * Revoke all refresh tokens for a user (full logout).
   */
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = await hashRefreshToken(rawRefreshToken);
    const stored = await refreshRepo.getByTokenHash(tokenHash);
    if (stored) {
      await refreshRepo.deleteById(stored.id);
    }
  },
});

export const authService = createAuthService(
  userRepository,
  refreshTokenRepository,
);
