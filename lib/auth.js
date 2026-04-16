'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useUserStore } from './userStore';

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

      const { data } = await supabase.auth.getSession();
      const normalized = normalizeUser(data?.session?.user ?? null);
      setUser(normalized);
      if (normalized) {
        setGlobalUser(normalized);
      } else {
        clearGlobalUser();
      }
      setLoading(false);
    };

    initializeAuth();

    if (!supabase) {
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const normalized = normalizeUser(session?.user ?? null);
      setUser(normalized);
      if (normalized) {
        setGlobalUser(normalized);
      } else {
        clearGlobalUser();
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [clearGlobalUser, setGlobalUser]);

  const signIn = async (email, password) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }

    const result = await supabase.auth.signInWithPassword({ email, password });
    if (!result.error && result.data?.session?.user) {
      const normalized = normalizeUser(result.data.session.user);
      setUser(normalized);
      setGlobalUser(normalized);
    }
    return result;
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
    }
    return result;
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured.') };
    }
    const result = await supabase.auth.signOut();
    clearGlobalUser();
    setUser(null);
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
