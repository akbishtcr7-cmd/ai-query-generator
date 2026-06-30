import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn('⚠️  Supabase env vars missing — check your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnon);
