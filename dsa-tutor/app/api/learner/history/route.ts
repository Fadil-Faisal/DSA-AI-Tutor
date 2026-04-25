// app/api/learner/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const { data: attempts, error } = await supabaseServer
      .from('problem_attempts')
      .select('topic, final_status, mistake_pattern, time_taken_seconds, attempts_count, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    const topicStats: Record<string, { total: number; solved: number; accuracy: number }> = {};
    for (const attempt of (attempts ?? [])) {
      if (!topicStats[attempt.topic]) {
        topicStats[attempt.topic] = { total: 0, solved: 0, accuracy: 0 };
      }
      topicStats[attempt.topic].total++;
      if (attempt.final_status === 'solved') topicStats[attempt.topic].solved++;
    }
    for (const topic of Object.keys(topicStats)) {
      const s = topicStats[topic];
      s.accuracy = s.total > 0 ? Math.round((s.solved / s.total) * 100) : 0;
    }

    return NextResponse.json({ attempts, topicStats });

  } catch (error: any) {
    console.error('[GET /api/learner/history] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}