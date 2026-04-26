// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { auth_id, full_name } = await req.json();

    if (!auth_id) {
      return NextResponse.json({ error: 'auth_id required' }, { status: 400 });
    }

    // Check if profile already exists for this user
    const { data: existing } = await supabaseServer
      .from('learner_profiles')
      .select('session_id')
      .eq('auth_id', auth_id)
      .single();

    if (existing) {
      return NextResponse.json({ sessionId: existing.session_id, isNew: false });
    }

    const sessionId = crypto.randomUUID();

    // Insert with auth_id to link to user account
    const { data: profile, error } = await supabaseServer
      .from('learner_profiles')
      .insert({
        session_id: sessionId,
        auth_id: auth_id,
        full_name: full_name || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[POST /api/auth/register] Profile insert error:', error);
      return NextResponse.json({ error: 'Failed to create profile', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ sessionId, isNew: true });
  } catch (error: unknown) {
    console.error('[POST /api/auth/register] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}