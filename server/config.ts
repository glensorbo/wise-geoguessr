const requireEnv = (name: string) => {
  const value = process.env[name];

  if (value == null || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getDatabaseUrl = () => requireEnv('DATABASE_URL');

export const getJwtSecret = () => requireEnv('JWT_SECRET');

export const getJwtIssuer = () => process.env.JWT_ISSUER ?? 'wise-geoguessr';

export const getSeedUserCredentials = () => {
  const email = process.env.SEED_USER_EMAIL;
  const password = process.env.SEED_USER_PASSWORD;

  if (email == null && password == null) {
    return null;
  }

  if (email == null || password == null) {
    throw new Error(
      'SEED_USER_EMAIL and SEED_USER_PASSWORD must both be set together.',
    );
  }

  return {
    email,
    password,
  };
};
