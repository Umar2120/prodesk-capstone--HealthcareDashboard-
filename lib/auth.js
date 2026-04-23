'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useUserStore } from './userStore';
import { ensureDoctorProfile } from './doctors';

const AuthContext = createContext();

const normalizeUser = (supabaseUser) => {
  if (!supabaseUser) return null;

  return {
    uid: supabaseUser.id,
    email: supabaseUser.email,
    name:
      supabaseUser.user_metadata?.full_name ||
      supabaseUser.user_metadata?.name ||
      supabaseUser.email?.split('@')[0] ||
      'User',
    role: supabaseUser.user_metadata?.role || 'patient',
    phone: supabaseUser.user_metadata?.phone || '',
    dob: supabaseUser.user_metadata?.dob || '',
    photo: supabaseUser.user_metadata?.photo || '',
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const setGlobalUser = useUserStore((state) => state.setUser);
  const clearGlobalUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!supabase) {
        setUser(null);
        clearGlobalUser();
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const normalized = normalizeUser(data?.session?.user ?? null);
        setUser(normalized);
        if (normalized) {
          setGlobalUser(normalized);
        } else {
          clearGlobalUser();
        }
      } catch {
        setUser(null);
        clearGlobalUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    if (!supabase) {
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Only process if event is SIGNED_IN or SIGNED_OUT
      // Ignore TOKEN_REFRESHED events to prevent unnecessary re-renders
      if (event === 'SIGNED_OUT') {
        const normalized = normalizeUser(null);
        setUser(normalized);
        clearGlobalUser();
        setLoading(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        const normalized = normalizeUser(session.user);
        setUser(normalized);
        if (normalized) {
          setGlobalUser(normalized);
        }
        setLoading(false);
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [clearGlobalUser, setGlobalUser]);

  const signIn = async (email, password) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (!result.error && result.data?.session?.user) {
        const normalized = normalizeUser(result.data.session.user);
        if (normalized?.role === 'doctor') {
          await ensureDoctorProfile(normalized);
        }
        setUser(normalized);
        setGlobalUser(normalized);
      }
      return result;
    } catch (error) {
      return {
        data: { session: null, user: null },
        error: new Error(
          /failed to fetch/i.test(error?.message || '')
            ? 'Unable to reach Supabase right now. Check your connection, VPN/ad blocker settings, and Supabase URL, then try again.'
            : 'Unable to sign in right now.'
        ),
      };
    }
  };

  const signUp = async (email, password, role = 'patient') => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    });

    if (!result.error && result.data?.user) {
      const normalized = normalizeUser(result.data.user);
      setUser(normalized);
      setGlobalUser(normalized);
      if (normalized?.role === 'doctor' && result.data?.session) {
        await ensureDoctorProfile(normalized);
      }
    }
    return result;
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    // Clear local state first to prevent auto-login issues
    clearGlobalUser();
    setUser(null);
    
    // Full sign-out to clear the session properly
    const result = await supabase.auth.signOut();
    return result;
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
