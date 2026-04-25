// app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseServer
      .from('learner_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: attempts, error: attemptsError } = await supabaseServer
      .from('problem_attempts')
      .select('topic, final_status, mistake_pattern, time_taken_seconds, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (attemptsError) {
      return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
    }

    const totalAttempts = attempts?.length || 0;
    const solvedCount = attempts?.filter(a => a.final_status === 'solved').length || 0;
    const accuracy = totalAttempts > 0 ? Math.round((solvedCount / totalAttempts) * 100) : 0;

    const topicCounts: Record<string, { total: number; solved: number }> = {};
    const mistakeCounts: Record<string, number> = {};

    for (const attempt of (attempts || [])) {
      const topic = attempt.topic;
      if (!topicCounts[topic]) {
        topicCounts[topic] = { total: 0, solved: 0 };
      }
      topicCounts[topic].total++;
      if (attempt.final_status === 'solved') {
        topicCounts[topic].solved++;
      }

      if (attempt.mistake_pattern) {
        mistakeCounts[attempt.mistake_pattern] = (mistakeCounts[attempt.mistake_pattern] || 0) + 1;
      }
    }

    const topMistakes = Object.entries(mistakeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }));

    const streakData = {
      current: profile.current_streak || 0,
      total: profile.total_problems_attempted || 0,
    };

    const confidenceScores = {
      arrays: profile.arrays_confidence || 0.5,
      trees: profile.trees_confidence || 0.5,
      graphs: profile.graphs_confidence || 0.5,
      dp: profile.dp_confidence || 0.5,
      recursion: profile.recursion_confidence || 0.5,
      sorting: profile.sorting_confidence || 0.5,
      searching: profile.searching_confidence || 0.5,
      strings: profile.strings_confidence || 0.5,
      heaps: profile.heaps_confidence || 0.5,
      linked_lists: profile.linked_lists_confidence || 0.5,
    };

    return NextResponse.json({
      stats: {
        totalAttempts,
        solvedCount,
        accuracy,
        streak: streakData,
        topMistakes,
        confidenceScores,
        targetCompany: profile.target_company,
        explanationMode: profile.explanation_mode,
      },
      attempts: attempts || [],
    });

  } catch (error: unknown) {
    console.error('[/api/stats] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}