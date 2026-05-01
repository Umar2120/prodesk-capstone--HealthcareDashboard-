import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isLikelyJwt = (value) =>
  typeof value === 'string' && value.length > 20 && value.length <= 4096 && value.split('.').length === 3;

export function createSupabaseServerClient(accessToken = '') {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured on the server.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: isLikelyJwt(accessToken) ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  });
}
