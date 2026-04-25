import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, videoId, watchTimeSeconds, completionPercentage, playbackSpeed, pausedAt, completed } = await req.json();

    if (!sessionId || !videoId) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, videoId' }, { status: 400 });
    }

    const pausedAtArray = pausedAt || [];

    const { data: existing } = await supabaseServer
      .from('video_progress')
      .select('*')
      .eq('session_id', sessionId)
      .eq('video_id', videoId)
      .single();

    let rewatchCount = existing?.rewatch_count || 0;
    if (!existing) {
      rewatchCount = 0;
    }

    const { error: upsertError } = await supabaseServer
      .from('video_progress')
      .upsert({
        session_id: sessionId,
        video_id: videoId,
        watch_time_seconds: watchTimeSeconds || 0,
        completion_percentage: completionPercentage || 0,
        playback_speed: playbackSpeed || 1.0,
        paused_at: pausedAtArray,
        completed: completed || false,
        rewatch_count: rewatchCount
      }, { onConflict: 'session_id, video_id' });

    if (upsertError) {
      console.error('Error upserting video progress:', upsertError);
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    if (completed) {
      const { data: video } = await supabaseServer
        .from('video_lessons')
        .select('duration_seconds')
        .eq('id', videoId)
        .single();

      const duration = video?.duration_seconds || 600;
      const studyMinutes = Math.floor(duration / 60);

      const { data: profile } = await supabaseServer
        .from('learning_profiles')
        .select('videos_watched, total_study_minutes')
        .eq('session_id', sessionId)
        .single();

      let videosWatched = profile?.videos_watched || [];
      if (!videosWatched.includes(videoId)) {
        videosWatched.push(videoId);
      }

      const needsRepetition = pausedAtArray.length > 5;
      const watchTimeMs = (watchTimeSeconds || 0) * 1000;
      const droppedOff = (completionPercentage || 0) < 0.5;
      const fastLearner = (playbackSpeed || 1.0) >= 1.5;

      await supabaseServer
        .from('learning_profiles')
        .upsert({
          session_id: sessionId,
          videos_watched: videosWatched,
          total_study_minutes: (profile?.total_study_minutes || 0) + studyMinutes,
          needs_repetition: needsRepetition,
          last_updated: new Date().toISOString()
        }, { onConflict: 'session_id' });
    }

    return NextResponse.json({
      success: true,
      completionPercentage: completionPercentage || 0,
      isCompleted: completed || false
    });

  } catch (error: unknown) {
    console.error('[/api/video/progress] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const videoId = searchParams.get('videoId');

    if (!sessionId || !videoId) {
      return NextResponse.json({ error: 'Missing sessionId or videoId' }, { status: 400 });
    }

    const { data: progress } = await supabaseServer
      .from('video_progress')
      .select('watch_time_seconds as watchTimeSeconds, completion_percentage as completionPercentage, rewatch_count as rewatchCount, completed')
      .eq('session_id', sessionId)
      .eq('video_id', videoId)
      .single();

    if (!progress) {
      return NextResponse.json({
        watchTimeSeconds: 0,
        completionPercentage: 0,
        rewatchCount: 0,
        completed: false
      });
    }

    return NextResponse.json(progress);

  } catch (error: unknown) {
    console.error('[/api/video/progress] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}