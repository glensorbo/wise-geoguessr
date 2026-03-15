export type AuthSession = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

const storageKey = 'wise-geoguessr-auth-session';

const hasLocalStorage = () => {
  return typeof window !== 'undefined' && 'localStorage' in window;
};

const isAuthSession = (value: unknown): value is AuthSession => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const { token, user } = value as Record<string, unknown>;

  if (typeof token !== 'string') {
    return false;
  }

  if (typeof user !== 'object' || user === null) {
    return false;
  }

  const { id, email } = user as Record<string, unknown>;

  return typeof id === 'string' && typeof email === 'string';
};

export const getStoredSession = () => {
  if (!hasLocalStorage()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(storageKey);

  if (rawSession === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as unknown;

    if (isAuthSession(parsed)) {
      return parsed;
    }

    console.warn('Removing invalid auth session from localStorage.');
    window.localStorage.removeItem(storageKey);
    return null;
  } catch {
    console.warn('Removing unreadable auth session from localStorage.');
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

export const saveStoredSession = (session: AuthSession) => {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(session));
};

export const clearStoredSession = () => {
  if (!hasLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(storageKey);
};
