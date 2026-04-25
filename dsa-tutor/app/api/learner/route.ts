// app/api/learner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { calculateConfidenceDelta, updateConfidence } from '@/lib/agent/confidence';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId query param required' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseServer
      .from('learner_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error || !profile) {
      const { data: newProfile, error: createError } = await supabaseServer
        .from('learner_profiles')
        .insert({ session_id: sessionId })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create learner profile' }, { status: 500 });
      }
      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile });

  } catch (error: unknown) {
    console.error('[GET /api/learner] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, topic, correct, timeTaken, explanationMode } = await req.json();

    if (!sessionId || !topic || correct === undefined) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, topic, correct' }, { status: 400 });
    }

    const delta = calculateConfidenceDelta(correct, timeTaken ?? 300, 1);
    await updateConfidence(sessionId, topic, delta);

    const { data: profile } = await supabaseServer
      .from('learner_profiles')
      .select('current_streak, total_problems_attempted')
      .eq('session_id', sessionId)
      .single();

    const newStreak = correct ? ((profile?.current_streak ?? 0) + 1) : 0;
    const newTotal = (profile?.total_problems_attempted ?? 0) + 1;

    const updatePayload: Record<string, unknown> = {
      current_streak: newStreak,
      total_problems_attempted: newTotal,
      updated_at: new Date().toISOString(),
    };
    if (explanationMode) updatePayload.explanation_mode = explanationMode;

    await supabaseServer
      .from('learner_profiles')
      .update(updatePayload)
      .eq('session_id', sessionId);

    return NextResponse.json({
      success: true,
      delta,
      newStreak,
      totalProblems: newTotal,
    });

  } catch (error: unknown) {
    console.error('[POST /api/learner] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}