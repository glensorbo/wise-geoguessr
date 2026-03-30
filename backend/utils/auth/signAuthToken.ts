import { SignJWT } from 'jose';

import type { UserRole } from '@backend/types/appJwtPayload';

const getSecret = () => new TextEncoder().encode(Bun.env.JWT_SECRET ?? '');

export const signAuthToken = (
  userId: string,
  email: string,
  role: UserRole,
): Promise<string> =>
  new SignJWT({ email, tokenType: 'auth', role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret());
