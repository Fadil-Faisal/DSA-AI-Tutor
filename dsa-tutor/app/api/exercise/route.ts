import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';
import { supabaseServer } from '@/lib/supabase/server';

const JUDGE0_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || 'https://ce.judge0.com';

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  java: 62,
  cpp: 54,
  javascript: 63,
};

export async function POST(req: NextRequest) {
  try {
    const { sessionId, exerciseId, topic, explanationMode, submittedCode, language, timeSpentSeconds } = await req.json();

    if (!sessionId || !exerciseId || !topic || !submittedCode || !language) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, exerciseId, topic, submittedCode, language' }, { status: 400 });
    }
    if (!LANGUAGE_IDS[language]) {
      return NextResponse.json({ error: `Invalid language. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}` }, { status: 400 });
    }

    const { data: exercise } = await supabaseServer
      .from('coding_exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const testInput = exercise.test_input || '';
    const expectedOutput = exercise.expected_output || '';

    const executionResponse = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: submittedCode,
          language_id: LANGUAGE_IDS[language],
          stdin: testInput,
          expected_output: expectedOutput,
        }),
      }
    );

    if (!executionResponse.ok) {
      return NextResponse.json({ error: 'Execution service unavailable' }, { status: 503 });
    }

    const execResult = await executionResponse.json();
    const actualOutput = (execResult.stdout || '').trim();
    const passed = execResult.status?.id === 3;
    const executionTime = execResult.time || '0.000s';

    let score = 0.0;
    if (passed) {
      score = 1.0;
    } else if (actualOutput && actualOutput.includes(expectedOutput.trim())) {
      score = 0.5;
    }

    const persona = getModePersona(explanationMode || 'simple');
    const feedbackPrompt = `
      ${persona}
      A student submitted code for a fill-in-the-blank exercise on ${topic}.
      Exercise: ${exercise.title}
      Their code:
      ${submittedCode}
      Expected output: ${expectedOutput}
      Actual output: ${actualOutput}
      Passed: ${passed}

      If passed: Write 2 sentences of positive reinforcement and one tip for improvement.
      If failed: Write 2 sentences explaining what went wrong using simple language.
      Then show the correct approach in pseudocode (not full code).
      Respond ONLY in JSON: { "feedback": "...", "tip": "..." }
    `;

    let aiFeedback = '';
    let aiTip = '';

    try {
      const { result: feedbackRaw } = await withFallback(
        () => ollamaChatJSON(persona, feedbackPrompt),
        async () => {
          const completion = await groq.chat.completions.create({
            model: GROQ_STRONG,
            messages: [{ role: 'user', content: feedbackPrompt }],
            response_format: { type: 'json_object' },
          });
          return completion.choices[0].message.content!;
        },
        () => geminiChat(feedbackPrompt),
        JSON.stringify({ feedback: passed ? 'Great work!' : 'Keep trying!', tip: 'Check the expected output.' })
      );

      const feedbackParsed = JSON.parse(feedbackRaw);
      aiFeedback = feedbackParsed.feedback || '';
      aiTip = feedbackParsed.tip || '';
    } catch (e) {
      aiFeedback = passed ? 'Great work!' : 'Keep trying!';
      aiTip = 'Check the expected output.';
    }

    const { data: profile } = await supabaseServer
      .from('learning_profiles')
      .select('exercise_scores')
      .eq('session_id', sessionId)
      .single();

    const exerciseScores = profile?.exercise_scores || {};
    exerciseScores[topic] = score;

    await supabaseServer
      .from('learning_profiles')
      .upsert({
        session_id: sessionId,
        exercise_scores: exerciseScores,
        last_updated: new Date().toISOString()
      }, { onConflict: 'session_id' });

    await supabaseServer.from('learning_progress').insert({
      session_id: sessionId,
      topic,
      stage: 'exercise',
      content_id: exerciseId,
      status: passed ? 'completed' : 'failed',
      score,
      time_spent_sec: timeSpentSeconds || 0
    });

    return NextResponse.json({
      passed,
      score,
      actualOutput,
      expectedOutput,
      executionTime,
      aiFeedback,
      aiTip,
      solution: exercise.solution
    });

  } catch (error: unknown) {
    console.error('[/api/exercise] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}