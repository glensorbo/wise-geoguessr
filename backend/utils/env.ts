const REQUIRED_ENV_VARS = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_SERVER',
  'POSTGRES_DB',
  'JWT_SECRET',
  'APP_URL',
] as const;

/**
 * Validates all required environment variables at startup.
 * Exits the process immediately if any are missing.
 * Call this before `Bun.serve()`.
 */
export const validateEnv = (): void => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !Bun.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(', ')}`,
    );
    console.error('   Copy .env.example to .env and fill in the values.');
    process.exit(1);
  }
};
