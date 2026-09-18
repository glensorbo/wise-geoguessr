import { jwtVerify } from 'jose';

import { errorOr } from '@backend/types/errorOr';

import type {
  AppJwtPayload,
  TokenType,
  UserRole,
} from '@backend/types/appJwtPayload';
import type { ErrorOr } from '@backend/types/errorOr';

const getSecret = () => new TextEncoder().encode(Bun.env.JWT_SECRET ?? '');

export const verifyToken = async (
  token: string,
): Promise<ErrorOr<AppJwtPayload>> => {
  const [result, err] = await jwtVerify(token, getSecret())
    .then((r) => [r, null] as const)
    .catch((e: unknown) => [null, e] as const);

  if (err !== null || result === null) {
    return errorOr(null, [
      { type: 'unauthorized', message: 'Invalid or expired token' },
    ]);
  }

  const { payload } = result;
  if (
    !payload.sub ||
    typeof payload.email !== 'string' ||
    typeof payload.tokenType !== 'string'
  ) {
    return errorOr(null, [
      { type: 'unauthorized', message: 'Invalid token payload' },
    ]);
  }

  return errorOr({
    sub: payload.sub,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : '',
    tokenType: payload.tokenType as TokenType,
    role: (typeof payload.role === 'string'
      ? payload.role
      : 'user') as UserRole,
  });
};
