import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseServer
      .from('learning_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    if (!profile) {
      return NextResponse.json({
        sessionId,
        learningPace: 'average',
        preferredModality: 'visual',
        needsRepetition: false,
        struggleAreas: [],
        strengthAreas: [],
        totalStudyMinutes: 0,
        topicProgress: {}
      });
    }

    const { data: progressRecords } = await supabaseServer
      .from('learning_progress')
      .select('topic, stage, status, score')
      .eq('session_id', sessionId);

    const topicStages: Record<string, { videoWatched: boolean; conceptQuizPassed: boolean; exerciseCompleted: boolean; problemsSolved: number; readyForNext: boolean }> = {};

    const allTopics = ['arrays', 'trees', 'graphs', 'dp', 'recursion', 'sorting', 'searching', 'strings', 'heaps', 'linked_lists'];

    for (const topic of allTopics) {
      topicStages[topic] = {
        videoWatched: false,
        conceptQuizPassed: false,
        exerciseCompleted: false,
        problemsSolved: 0,
        readyForNext: false
      };
    }

    if (progressRecords) {
      for (const record of progressRecords) {
        const topic = record.topic;
        if (!topicStages[topic]) continue;

        if (record.stage === 'video' && record.status === 'completed') {
          topicStages[topic].videoWatched = true;
        }
        if (record.stage === 'concept_quiz' && (record.status === 'completed' || record.status === 'passed') && (record.score || 0) >= 0.6) {
          topicStages[topic].conceptQuizPassed = true;
        }
        if (record.stage === 'exercise' && (record.status === 'completed' || record.score === 1)) {
          topicStages[topic].exerciseCompleted = true;
        }
        if (record.stage === 'problem' && record.status === 'completed') {
          topicStages[topic].problemsSolved++;
        }
      }

      for (const topic of allTopics) {
        const t = topicStages[topic];
        t.readyForNext = t.videoWatched && t.conceptQuizPassed && t.exerciseCompleted;
      }
    }

    const videosWatched = profile?.videos_watched?.length || 0;
    const conceptScores = profile?.concept_scores || {};
    const conceptsPassed = Object.values(conceptScores)
      .filter((score) => (score as number) >= 0.6).length;

    return NextResponse.json({
      sessionId,
      learningPace: profile?.learning_pace || 'average',
      preferredModality: profile?.preferred_modality || 'visual',
      needsRepetition: profile?.needs_repetition || false,
      struggleAreas: profile?.struggle_areas || [],
      strengthAreas: profile?.strength_areas || [],
      totalStudyMinutes: profile?.total_study_minutes || 0,
      videosWatched,
      conceptsPassed,
      topicProgress: topicStages
    });

  } catch (error: unknown) {
    console.error('[/api/learning-profile] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, preferredModality, learningPace } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      session_id: sessionId,
      last_updated: new Date().toISOString()
    };

    if (preferredModality) {
      if (!['visual', 'auditory', 'kinesthetic', 'reading'].includes(preferredModality)) {
        return NextResponse.json({ error: 'Invalid preferredModality' }, { status: 400 });
      }
      updates.preferred_modality = preferredModality;
    }

    if (learningPace) {
      if (!['slow', 'average', 'fast'].includes(learningPace)) {
        return NextResponse.json({ error: 'Invalid learningPace' }, { status: 400 });
      }
      updates.learning_pace = learningPace;
    }

    const { data: profile } = await supabaseServer
      .from('learning_profiles')
      .upsert(updates, { onConflict: 'session_id' })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      profile: profile || updates
    });

  } catch (error: unknown) {
    console.error('[/api/learning-profile] POST Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}