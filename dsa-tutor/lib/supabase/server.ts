// lib/supabase/server.ts
// Server-side Supabase client — uses service role key (bypasses RLS).
// NEVER import this in any client component or file starting with NEXT_PUBLIC_.

import { createClient } from '@supabase/supabase-js';

const getSupabaseServer = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    // During build, return a placeholder - actual calls won't work until env vars are set
    console.warn('[supabase/server] Missing env vars - using placeholder');
    return createClient('https://placeholder.supabase.co', 'placeholder', { auth: { persistSession: false } });
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export const supabaseServer = getSupabaseServer();