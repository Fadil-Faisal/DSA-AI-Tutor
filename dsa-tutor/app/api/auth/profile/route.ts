// app/api/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const auth_id = req.nextUrl.searchParams.get('auth_id');

    if (!auth_id) {
      return NextResponse.json({ error: 'auth_id required' }, { status: 400 });
    }

    // Try to find by auth_id first (if column exists)
    let { data: profile, error } = await supabaseServer
      .from('learner_profiles')
      .select('session_id, full_name')
      .eq('auth_id', auth_id)
      .single();

    // If auth_id column doesn't exist (error code 42703), fall back to empty
    if (error?.code === '42703') {
      return NextResponse.json({ sessionId: null, full_name: null });
    }

    if (error || !profile) {
      return NextResponse.json({ sessionId: null, full_name: null });
    }

    return NextResponse.json({ sessionId: profile.session_id, full_name: profile.full_name });
  } catch (error: unknown) {
    console.error('[GET /api/auth/profile] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}