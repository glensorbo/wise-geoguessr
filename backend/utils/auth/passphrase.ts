/**
 * Generates a cryptographically random passphrase using 32 random bytes (256 bits of entropy).
 * Encoded as base64url — no word list, no predictable structure.
 *
 * This is used as a temporary initial password that is hashed before storage
 * and replaced by the user during onboarding. It never needs to be typed.
 */
export const generatePassphrase = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64url');
};
