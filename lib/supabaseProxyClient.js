'use client';

import { supabase } from './supabaseClient';
import { clearFallbackSession, isLikelyJwt, readFallbackSession, writeFallbackSession } from './fallbackSession';

const API_ROUTE = '/api/supabase';

const refreshStoredSession = async (fallbackSession) => {
  if (typeof fallbackSession?.refreshToken !== 'string' || fallbackSession.refreshToken.length < 10) {
    return '';
  }

  try {
    const response = await fetch(API_ROUTE, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'refreshSession',
        refreshToken: fallbackSession.refreshToken,
      }),
    });

    const result = await response.json();

    if (!response.ok || !isLikelyJwt(result?.session?.access_token)) {
      clearFallbackSession();
      return '';
    }

    writeFallbackSession({
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token || fallbackSession.refreshToken,
      expiresAt: result.session.expires_at ? result.session.expires_at * 1000 : Date.now() + 60 * 60 * 1000,
      user: fallbackSession.user,
    });

    return result.session.access_token;
  } catch {
    return '';
  }
};

const readSessionTokens = async () => {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (isLikelyJwt(data?.session?.access_token)) {
        return {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token || '',
        };
      }
    } catch {
      // Fall back to the lightweight session cache below.
    }
  }

  const fallbackSession = readFallbackSession({ allowExpired: true });
  const tokenExpiresAt = Number(fallbackSession?.expiresAt || 0);

  if (isLikelyJwt(fallbackSession?.accessToken) && (!tokenExpiresAt || Date.now() < tokenExpiresAt - 30000)) {
    return {
      accessToken: fallbackSession.accessToken,
      refreshToken: fallbackSession.refreshToken || '',
    };
  }

  const refreshedAccessToken = await refreshStoredSession(fallbackSession);
  if (isLikelyJwt(refreshedAccessToken)) {
    const refreshedSession = readFallbackSession({ allowExpired: true });
    return {
      accessToken: refreshedAccessToken,
      refreshToken: refreshedSession?.refreshToken || fallbackSession?.refreshToken || '',
    };
  }
  return { accessToken: '', refreshToken: fallbackSession?.refreshToken || '' };
};

export const isNetworkFetchError = (error) => {
  const message = error?.message || '';
  return Boolean(error) && (
    Number(error.status || 0) >= 500 ||
    /failed to fetch|fetch failed|networkerror|network request failed|enotfound|econnreset|etimedout|supabase proxy failed/i.test(message)
  );
};

export async function callSupabaseProxy(action, payload = {}, { includeAccessToken = false } = {}) {
  const sessionTokens = includeAccessToken ? await readSessionTokens() : {};
  const requestBody = sessionTokens.accessToken || sessionTokens.refreshToken
    ? { action, ...sessionTokens, ...payload }
    : { action, ...payload };

  const response = await fetch(API_ROUTE, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result?.error || `Supabase proxy failed with HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }

  return result;
}
