export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type SessionClaims = {
  userId: string;
  email: string;
};
