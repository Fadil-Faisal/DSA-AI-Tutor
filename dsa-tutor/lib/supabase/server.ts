// lib/supabase/server.ts
// Server-side Supabase client — uses service role key (bypasses RLS).
// NEVER import this in any client component or file starting with NEXT_PUBLIC_.

import { createClient } from '@supabase/supabase-js';

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);