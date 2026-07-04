import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const missingConfigError = new Error(
  'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env.'
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnon);

const missingSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
    signUp: async () => ({ data: null, error: missingConfigError }),
    signInWithPassword: async () => ({ data: null, error: missingConfigError }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({ data: null, error: missingConfigError }),
    resetPasswordForEmail: async () => ({ data: null, error: missingConfigError }),
    refreshSession: async () => ({ data: { session: null }, error: null }),
  },
};

if (!isSupabaseConfigured) {
  console.warn('Supabase env vars missing. Add them to client/.env.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnon)
  : missingSupabaseClient;
