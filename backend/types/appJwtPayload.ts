export type TokenType = 'signup' | 'auth';
export type UserRole = 'admin' | 'user';

export type AppJwtPayload = {
  sub: string;
  email: string;
  name: string;
  tokenType: TokenType;
  role: UserRole;
};
