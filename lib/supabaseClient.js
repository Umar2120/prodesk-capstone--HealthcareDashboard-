import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryRequest = (error) => {
  if (!error) return false;
  return error.name === 'TypeError' || /failed to fetch/i.test(error.message || '');
};

const supabaseFetch = async (input, init) => {
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      if (!shouldRetryRequest(error) || attempt === 2) {
        throw error;
      }
      await sleep(400 * (attempt + 1));
    }
  }

  throw lastError;
};

export const supabase =
  typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          fetch: supabaseFetch,
        },
      })
    : null;
