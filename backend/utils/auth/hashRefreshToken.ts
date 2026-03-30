/**
 * SHA-256 hash of a refresh token for safe DB storage.
 * Compare incoming cookie tokens by hashing them before lookup — never store the raw token.
 */
export const hashRefreshToken = async (token: string): Promise<string> => {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hashBuffer).toString('hex');
};
