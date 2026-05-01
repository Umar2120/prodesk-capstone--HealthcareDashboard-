'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUserStore } from './userStore';
import { cacheDoctorProfile, ensureDoctorProfile } from './doctors';
import { callSupabaseProxy, isNetworkFetchError } from './supabaseProxyClient';
import { clearFallbackSession, readFallbackSession, writeFallbackSession } from './fallbackSession';
import { supabase } from './supabaseClient';

const AuthContext = createContext();
const VALID_ROLES = new Set(['patient', 'doctor']);

const normalizeRole = (role, fallback = 'patient') =>
  VALID_ROLES.has(role) ? role : fallback;

const normalizeUser = (supabaseUser, roleOverride = '') => {
  if (!supabaseUser) return null;

  const resolvedRole = normalizeRole(supabaseUser.user_metadata?.role, normalizeRole(roleOverride));

  return {
    uid: supabaseUser.id,
    email: supabaseUser.email,
    name:
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split('@')[0] ||
      'User',
    role: resolvedRole,
    phone: supabaseUser.user_metadata?.phone || '',
    dob: supabaseUser.user_metadata?.dob || '',
    photo: supabaseUser.user_metadata?.photo || '',
  };
};

const normalizeFallbackUser = (fallbackSession) => {
  if (!fallbackSession?.user) return null;
  return {
    ...fallbackSession.user,
    role: normalizeRole(fallbackSession.user.role),
  };
};

const clearSupabaseBrowserStorage = () => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return;
  }

  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith('sb-') && key.includes('-auth-token'))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage cleanup failures.
  }
};

const syncDoctorProfileIfNeeded = async (normalizedUser) => {
  if (normalizedUser?.role !== 'doctor') {
    return;
  }

  cacheDoctorProfile(normalizedUser);

  try {
    await ensureDoctorProfile(normalizedUser);
  } catch {
    // Keep auth usable even if doctor-directory sync fails.
  }
};

const persistSupabaseBrowserSession = async (session) => {
  if (!supabase || !session?.access_token || !session?.refresh_token) {
    return;
  }

  try {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  } catch {
    // The fallback session cache still keeps the app usable if browser persistence fails.
  }
};

const writeAppSession = async (session, normalizedUser) => {
  if (!session?.access_token || !normalizedUser) {
    return;
  }

  writeFallbackSession({
    accessToken: session.access_token,
    refreshToken: session.refresh_token || '',
    expiresAt: session.expires_at ? session.expires_at * 1000 : Date.now() + 60 * 60 * 1000,
    user: normalizedUser,
  });

  await persistSupabaseBrowserSession(session);
};

const reachabilityMessage =
  'Unable to reach Supabase right now. Check your connection, VPN/ad blocker settings, and Supabase URL, then try again.';

const isReachabilityError = (error) => isNetworkFetchError(error);

const signInWithBrowserClient = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

const signUpWithBrowserClient = async (email, password, role) => {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const setGlobalUser = useUserStore((state) => state.setUser);
  const clearGlobalUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      const fallbackSession = readFallbackSession();
      let normalized = normalizeFallbackUser(fallbackSession);

      if (!normalized && supabase) {
        try {
          const { data } = await supabase.auth.getSession();
          normalized = normalizeUser(data?.session?.user ?? null);

          if (normalized && data?.session) {
            await writeAppSession(data.session, normalized);
          }
        } catch {
          normalized = null;
        }
      }

      if (!isMounted) return;

      setUser(normalized);

      if (normalized) {
        setGlobalUser(normalized);
        void syncDoctorProfileIfNeeded(normalized);
      } else {
        clearGlobalUser();
      }

      setLoading(false);
    };

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [clearGlobalUser, setGlobalUser]);

  const signIn = async (email, password, roleHint = '') => {
    setLoading(true);

    try {
      let data;

      try {
        data = await signInWithBrowserClient(email, password);
      } catch (browserError) {
        if (!isReachabilityError(browserError)) {
          throw browserError;
        }

        data = await callSupabaseProxy(
          'signIn',
          { email, password },
          { includeAccessToken: false }
        );
      }

      const normalized = normalizeUser(data?.session?.user ?? data?.user ?? null, roleHint);
      if (!normalized || !data?.session?.access_token) {
        throw new Error('Sign in succeeded but no active session was returned. Confirm your email if required, then try again.');
      }

      if (normalized && data?.session?.access_token) {
        await writeAppSession(data.session, normalized);
        void syncDoctorProfileIfNeeded(normalized);
        setUser(normalized);
        setGlobalUser(normalized);
      }
      return { data: { ...data, normalizedUser: normalized }, error: null };
    } catch (error) {
      const message = error?.message || '';
      return {
        data: { session: null, user: null },
        error: new Error(
          isReachabilityError(error)
            ? reachabilityMessage
            : message || 'Unable to sign in right now.'
        ),
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, role = 'patient') => {
    setLoading(true);

    try {
      let data;

      try {
        data = await signUpWithBrowserClient(email, password, role);
      } catch (browserError) {
        if (!isReachabilityError(browserError)) {
          throw browserError;
        }

        data = await callSupabaseProxy(
          'signUp',
          { email, password, role },
          { includeAccessToken: false }
        );
      }

      const normalized = normalizeUser(data?.session?.user ?? data?.user ?? null, role);
      if (normalized?.role === 'doctor') {
        cacheDoctorProfile(normalized);
      }

      if (normalized && data?.session) {
        await writeAppSession(data.session, normalized);
        void syncDoctorProfileIfNeeded(normalized);
        setUser(normalized);
        setGlobalUser(normalized);
      }

      return { data: { ...data, normalizedUser: normalized }, error: null };
    } catch (error) {
      const message = error?.message || '';
      return {
        data: { session: null, user: null },
        error: new Error(
          isReachabilityError(error)
            ? reachabilityMessage
            : message || 'Unable to register right now.'
        ),
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    // Clear local state first to prevent auto-login issues
    clearGlobalUser();
    setUser(null);
    clearFallbackSession();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Local cleanup below is still enough to leave the app.
      }
    }
    clearSupabaseBrowserStorage();
    setLoading(false);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
