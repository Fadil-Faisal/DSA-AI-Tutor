import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';
import { supabaseServer } from '@/lib/supabase/server';

type LastActionType = 'video_completed' | 'concept_quiz_completed' | 'exercise_completed' | 'problem_completed' | 'quiz_completed';

interface LastAction {
  type: LastActionType;
  contentId: string;
  score?: number;
  timeSpentSeconds: number;
  rewatchCount?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, explanationMode, lastAction } = await req.json();

    if (!sessionId || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, explanationMode' }, { status: 400 });
    }
    if (!['simple', 'complex'].includes(explanationMode)) {
      return NextResponse.json({ error: 'explanationMode must be "simple" or "complex"' }, { status: 400 });
    }
    if (!lastAction || !lastAction.type) {
      return NextResponse.json({ error: 'lastAction.type is required' }, { status: 400 });
    }
    if (!['video_completed', 'concept_quiz_completed', 'exercise_completed', 'problem_completed', 'quiz_completed'].includes(lastAction.type)) {
      return NextResponse.json({ error: 'Invalid lastAction.type' }, { status: 400 });
    }
    if (lastAction.score !== undefined && (lastAction.score < 0 || lastAction.score > 1)) {
      return NextResponse.json({ error: 'score must be between 0 and 1' }, { status: 400 });
    }

    const { data: existingProfile } = await supabaseServer
      .from('learning_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    let learningProfile = existingProfile || {
      session_id: sessionId,
      learning_pace: 'average',
      preferred_modality: 'visual',
      attention_span_minutes: 20,
      prefers_examples: true,
      needs_repetition: false,
      struggle_areas: [],
      strength_areas: [],
      videos_watched: [],
      concept_scores: {},
      exercise_scores: {},
      total_study_minutes: 0
    };

    if (!existingProfile) {
      await supabaseServer.from('learning_profiles').insert(learningProfile);
    }

    if (lastAction.type === 'video_completed') {
      const videoId = lastAction.contentId;
      const video = await supabaseServer.from('video_lessons').select('*').eq('id', videoId).single();
      const watchTime = lastAction.timeSpentSeconds || 0;
      const rewatchCount = lastAction.rewatchCount || 0;
      const duration = video.data?.duration_seconds || 600;

      const watchedVideos = learningProfile.videos_watched || [];
      if (!watchedVideos.includes(videoId)) {
        watchedVideos.push(videoId);
      }

      const properlyWatched = watchTime > duration * 0.8;
      const fastSkimmer = watchTime < duration * 0.3;
      const needsRepetition = rewatchCount > 1;

      await supabaseServer
        .from('learning_profiles')
        .update({
          videos_watched: watchedVideos,
          needs_repetition: needsRepetition || learningProfile.needs_repetition,
          last_updated: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    if (lastAction.type === 'concept_quiz_completed') {
      const topic = lastAction.contentId.includes('-') ? lastAction.contentId.split('-')[1] : 'arrays';
      const score = lastAction.score || 0;
      const conceptScores = learningProfile.concept_scores || {};
      conceptScores[topic] = score;

      const struggleAreas = learningProfile.struggle_areas || [];
      const strengthAreas = learningProfile.strength_areas || [];

      if (score < 0.6 && !struggleAreas.includes(topic)) {
        struggleAreas.push(topic);
      }
      if (score >= 0.85 && !strengthAreas.includes(topic)) {
        strengthAreas.push(topic);
      }

      await supabaseServer
        .from('learning_profiles')
        .update({
          concept_scores: conceptScores,
          struggle_areas: struggleAreas,
          strength_areas: strengthAreas,
          last_updated: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    if (lastAction.type === 'exercise_completed') {
      const topic = lastAction.contentId.includes('-') ? lastAction.contentId.split('-')[1] : 'arrays';
      const score = lastAction.score || 0;
      const exerciseScores = learningProfile.exercise_scores || {};
      exerciseScores[topic] = score;

      await supabaseServer
        .from('learning_profiles')
        .update({
          exercise_scores: exerciseScores,
          last_updated: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    if (lastAction.type === 'problem_completed') {
      const score = lastAction.score || 0;
      const totalStudyMinutes = (learningProfile.total_study_minutes || 0) + Math.floor((lastAction.timeSpentSeconds || 0) / 60);

      await supabaseServer
        .from('learning_profiles')
        .update({
          total_study_minutes: totalStudyMinutes,
          last_updated: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    }

    const { data: refreshedProfile } = await supabaseServer
      .from('learning_profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    learningProfile = refreshedProfile || learningProfile;

    const conceptScores = learningProfile?.concept_scores || {};
    const exerciseScores = learningProfile?.exercise_scores || {};
    const struggleAreas = learningProfile?.struggle_areas || [];
    const strengthAreas = learningProfile?.strength_areas || [];
    const videosWatched = learningProfile?.videos_watched || [];

    let recommendedStage = 'video';
    let nextTopic = 'arrays';

    const persona = getModePersona(explanationMode);
    const prompt = `
      ${persona}

      You are an AI learning path engine for a DSA tutor platform.

      Student learning profile:
      - Concept quiz scores: ${JSON.stringify(conceptScores)}
      - Exercise scores: ${JSON.stringify(exerciseScores)}
      - Struggle areas: ${JSON.stringify(struggleAreas)}
      - Strength areas: ${JSON.stringify(strengthAreas)}
      - Learning pace: ${learningProfile?.learning_pace || 'average'}
      - Needs repetition: ${learningProfile?.needs_repetition || false}
      - Videos watched: ${JSON.stringify(videosWatched)}
      - Last action: ${lastAction.type} on ${lastAction.contentId} with score ${lastAction.score ?? 'N/A'}

      Available topics: arrays, trees, graphs, dp, recursion, sorting, searching, strings, heaps, linked_lists

      Decision rules:
      1. If last concept quiz score < 0.6: recommend REWATCHING the same video before moving on
      2. If last exercise score < 0.5: recommend another exercise for the same topic
      3. If last video was just completed with score > 0: move to concept quiz for that topic
      4. If last concept quiz passed (score >= 0.6): move to coding exercise for that topic
      5. If last exercise passed (score >= 0.5): move to full problem for that topic
      6. If student needs repetition AND concept score < 0.7: recommend intermediate video before problems
      7. Otherwise: pick the topic with the lowest combined (confidence + concept_score) average

      Respond ONLY in raw JSON (no markdown):
      {
        "nextTopic": "arrays",
        "nextStage": "video" | "concept_quiz" | "exercise" | "problem",
        "reasoning": "2-sentence explanation shown to the student",
        "urgency": "low" | "medium" | "high"
      }
    `;

    const { result: aiRaw, source } = await withFallback(
      () => ollamaChatJSON(persona, prompt),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_STRONG,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(prompt),
      JSON.stringify({ nextTopic: 'arrays', nextStage: 'video', reasoning: 'Starting your learning journey with arrays.', urgency: 'medium' })
    );

    console.log(`[/api/agent/next-step] AI source: ${source}`);

    let parsed: { nextTopic: string; nextStage: string; reasoning: string; urgency: string };
    try {
      parsed = JSON.parse(aiRaw);
    } catch {
      parsed = { nextTopic: 'arrays', nextStage: 'video', reasoning: 'Starting your learning journey with arrays.', urgency: 'medium' };
    }

    nextTopic = parsed.nextTopic;
    recommendedStage = parsed.nextStage;
    const reasoning = parsed.reasoning;
    const urgency = parsed.urgency;

    let content: Record<string, unknown> | null = null;

    if (recommendedStage === 'video') {
      const { data: video } = await supabaseServer
        .from('video_lessons')
        .select('id, title, video_url, duration_seconds, key_concepts, thumbnail_url')
        .eq('topic', nextTopic)
        .eq('difficulty', 'intro')
        .limit(1)
        .single();

      content = video ? {
        id: video.id,
        title: video.title,
        videoUrl: video.video_url,
        durationSeconds: video.duration_seconds,
        keyConcepts: video.key_concepts,
        thumbnailUrl: video.thumbnail_url
      } : null;
    } else if (recommendedStage === 'concept_quiz') {
      const videoId = `video-${nextTopic}-intro`;
      const { data: questions } = await supabaseServer
        .from('concept_questions')
        .select('id, question_text, question_type, options, order_index, correct_answer')
        .eq('video_id', videoId)
        .order('order_index');

      content = { questions: questions || [] };
    } else if (recommendedStage === 'exercise') {
      const { data: exercise } = await supabaseServer
        .from('coding_exercises')
        .select('id, topic, type, difficulty, title, prompt, starter_code, solution, hints, test_input, expected_output')
        .eq('topic', nextTopic)
        .eq('difficulty', 'beginner')
        .limit(1)
        .single();

      content = exercise;
    } else if (recommendedStage === 'problem') {
      const { data: problem } = await supabaseServer
        .from('problems_bank')
        .select('id, topic, difficulty, title, description, examples, hints, solution')
        .eq('topic', nextTopic)
        .eq('difficulty', 'Easy')
        .limit(1)
        .single();

      content = problem;
    }

    await supabaseServer.from('learning_progress').insert({
      session_id: sessionId,
      topic: nextTopic,
      stage: recommendedStage,
      content_id: content?.id || `${recommendedStage}-${nextTopic}`,
      status: 'shown',
      ai_reasoning: reasoning
    });

    return NextResponse.json({
      nextStage: recommendedStage,
      topic: nextTopic,
      reasoning,
      urgency,
      content,
      learningProfile: {
        pace: learningProfile?.learning_pace || 'average',
        modality: learningProfile?.preferred_modality || 'visual',
        needsRepetition: learningProfile?.needs_repetition || false,
        struggleAreas,
        strengthAreas
      }
    });

  } catch (error: unknown) {
    console.error('[/api/agent/next-step] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}