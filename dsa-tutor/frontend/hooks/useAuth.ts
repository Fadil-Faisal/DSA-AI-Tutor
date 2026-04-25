'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/browser';
import { useLearnerStore } from '@/store/learnerStore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUserName } = useLearnerStore();

  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Learner';
        setUserName(name);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Learner';
        setUserName(name);
      } else {
        setUserName('');
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserName]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}
