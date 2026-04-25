// app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';
import { supabaseServer } from '@/lib/supabase/server';
import { getDueTopics } from '@/lib/agent/spaced';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, explanationMode, confidence, lastAttempt } = await req.json();

    if (!sessionId || !explanationMode || !confidence) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, explanationMode, confidence' }, { status: 400 });
    }
    if (!['simple', 'complex'].includes(explanationMode)) {
      return NextResponse.json({ error: 'explanationMode must be "simple" or "complex"' }, { status: 400 });
    }

    const learningProfile = await supabaseServer
      .from('learning_profiles')
      .select('videos_watched, concept_scores')
      .eq('session_id', sessionId)
      .single();

    const videosWatched = learningProfile.data?.videos_watched?.length ?? 0;
    const conceptsPassed = Object.values(learningProfile.data?.concept_scores ?? {})
      .filter((score) => (score as number) >= 0.6).length;

    if (videosWatched < 3 || conceptsPassed < 3) {
      return NextResponse.json({
        redirect: true,
        message: 'Complete at least 3 video lessons and concept quizzes first.',
        suggestedRoute: '/api/agent/next-step',
        videosWatched,
        conceptsPassed,
        required: 3
      }, { status: 200 });
    }

    const weakestTopic = Object.entries(confidence as Record<string, number>)
      .sort(([, a], [, b]) => a - b)[0][0];

    const dueTopics = await getDueTopics(sessionId);

    const { data: recentAttempts } = await supabaseServer
      .from('problem_attempts')
      .select('topic, created_at, final_status')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20);

    const persona = getModePersona(explanationMode);
    const prompt = `
      ${persona}

      You are an AI tutor deciding what DSA problem to give a student next.

      Student confidence scores (0.0 = no confidence, 1.0 = expert):
      ${JSON.stringify(confidence, null, 2)}

      Weakest topic: ${weakestTopic}
      Topics due for review (not practiced in 48h): ${JSON.stringify(dueTopics)}
      Last attempt: ${JSON.stringify(lastAttempt ?? null)}
      Recent topics practiced: ${JSON.stringify(recentAttempts?.map((a: { topic: string }) => a.topic) ?? [])}

      Decision rules:
      - Prioritize topics with confidence below 0.4
      - If a topic is due for spaced repetition, include it
      - Vary difficulty: Easy if confidence < 0.3, Medium if 0.3–0.7, Hard if > 0.7
      - Don't repeat the same topic 3 times in a row

      Respond ONLY with valid JSON in this exact shape:
      {
        "topic": "arrays",
        "difficulty": "Easy",
        "reasoning": "2-3 sentences explaining why this problem was chosen, in the appropriate explanation mode tone",
        "decision_type": "next_problem"
      }

      decision_type must be one of: "next_problem" | "review" | "new_topic"
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
      JSON.stringify({ topic: weakestTopic, difficulty: 'Easy', reasoning: 'Focusing on your weakest area.', decision_type: 'next_problem' })
    );

    console.log(`[/api/agent] AI source: ${source}`);

    let parsed: { topic: string; difficulty: string; reasoning: string; decision_type: string };
    try {
      parsed = JSON.parse(aiRaw);
    } catch {
      parsed = { topic: weakestTopic, difficulty: 'Easy', reasoning: 'Focusing on your weakest area.', decision_type: 'next_problem' };
    }

    const { data: problem, error: problemError } = await supabaseServer
      .from('problems_bank')
      .select('*')
      .eq('topic', parsed.topic)
      .eq('difficulty', parsed.difficulty)
      .limit(1)
      .single();

    if (problemError || !problem) {
      const { data: fallbackProblem } = await supabaseServer
        .from('problems_bank')
        .select('*')
        .eq('topic', weakestTopic)
        .limit(1)
        .single();

      if (!fallbackProblem) {
        return NextResponse.json({ error: 'No problems found in database. Please run the seed script.' }, { status: 500 });
      }

      return NextResponse.json({ problem: fallbackProblem, reasoning: parsed.reasoning, decision_type: parsed.decision_type, ai_source: source });
    }

    await supabaseServer.from('agent_decisions').insert({
      session_id: sessionId,
      decision_type: parsed.decision_type,
      reasoning: parsed.reasoning,
    });

    return NextResponse.json({
      problem,
      reasoning: parsed.reasoning,
      decision_type: parsed.decision_type,
      ai_source: source,
    });

  } catch (error: unknown) {
    console.error('[/api/agent] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}