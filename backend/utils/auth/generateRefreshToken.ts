/**
 * Generates a cryptographically random refresh token (32 bytes / 256 bits of entropy).
 * Returns the raw hex string — store the hash, send the raw token in a cookie.
 */
export const generateRefreshToken = (): string => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('hex');
};
