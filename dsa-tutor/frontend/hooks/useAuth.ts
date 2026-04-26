'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/browser';
import { useLearnerStore } from '@/store/learnerStore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper to sync user to store - using getState() to avoid dependency issues
    const syncUserToStore = (u: User | null) => {
      setUser(u);
      const store = useLearnerStore.getState();
      
      if (u) {
        if (store.userId && store.userId !== u.id) {
          store.resetEntireStore();
        }
        
        const name = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Learner';
        store.setUserName(name);
        store.setUserId(u.id);
      } else {
        store.setUserName('');
        store.setUserId(null);
      }
    };

    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserToStore(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        useLearnerStore.getState().resetEntireStore();
      }
      syncUserToStore(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    useLearnerStore.getState().resetEntireStore();
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}
