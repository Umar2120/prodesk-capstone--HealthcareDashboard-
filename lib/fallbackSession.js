'use client';

const FALLBACK_SESSION_KEY = 'vitalsync.fallbackSession';
const MAX_TOKEN_LENGTH = 12000;

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const isLikelyJwt = (value) =>
  typeof value === 'string' &&
  value.length > 20 &&
  value.length <= MAX_TOKEN_LENGTH &&
  value.split('.').length === 3;

export function readFallbackSession({ allowExpired = false } = {}) {
  if (!canUseStorage()) return null;

  try {
    const rawValue = window.localStorage.getItem(FALLBACK_SESSION_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);

    if (!parsed?.accessToken || !isLikelyJwt(parsed.accessToken)) {
      window.localStorage.removeItem(FALLBACK_SESSION_KEY);
      return null;
    }

    if (!allowExpired && parsed?.expiresAt && Date.now() >= parsed.expiresAt) {
      window.localStorage.removeItem(FALLBACK_SESSION_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeFallbackSession(session) {
  if (!canUseStorage()) return;

  try {
    if (!session?.accessToken || !isLikelyJwt(session.accessToken)) {
      window.localStorage.removeItem(FALLBACK_SESSION_KEY);
      return;
    }

    window.localStorage.setItem(FALLBACK_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage write failures.
  }
}

export function clearFallbackSession() {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(FALLBACK_SESSION_KEY);
  } catch {
    // Ignore storage removal failures.
  }
}
