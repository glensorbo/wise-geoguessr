import { jwtVerify, SignJWT } from 'jose';

import { getJwtIssuer, getJwtSecret } from '../config';

import type { SessionClaims } from './types';

const getSigningKey = () => {
  return new TextEncoder().encode(getJwtSecret());
};

export const createSessionToken = async (claims: SessionClaims) => {
  return new SignJWT({ email: claims.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(getJwtIssuer())
    .setSubject(claims.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSigningKey());
};

export const verifySessionToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getSigningKey(), {
    issuer: getJwtIssuer(),
  });

  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new Error('JWT payload is missing required claims.');
  }

  return {
    userId: payload.sub,
    email: payload.email,
  } satisfies SessionClaims;
};
