// app/api/evaluate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_FAST } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';
import { supabaseServer } from '@/lib/supabase/server';
import { calculateConfidenceDelta, updateConfidence } from '@/lib/agent/confidence';

const VALID_MISTAKE_PATTERNS = [
  'off_by_one',
  'null_check_missing',
  'wrong_base_case',
  'wrong_algorithm',
  'visited_not_marked',
];

export async function POST(req: NextRequest) {
  try {
    const { sessionId, problemId, code, language, explanationMode, timeTaken, attemptsCount } = await req.json();

    if (!sessionId || !problemId || !code || !language || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!['simple', 'complex'].includes(explanationMode)) {
      return NextResponse.json({ error: 'Invalid explanationMode' }, { status: 400 });
    }
    if (!['python', 'java', 'cpp', 'javascript'].includes(language)) {
      return NextResponse.json({ error: 'Invalid language. Must be python, java, cpp, or javascript' }, { status: 400 });
    }

    const { data: problem, error: problemError } = await supabaseServer
      .from('problems_bank')
      .select('*')
      .eq('id', problemId)
      .single();

    if (problemError || !problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const persona = getModePersona(explanationMode);
    const prompt = `
      ${persona}

      You are a DSA tutor evaluating a student's code submission.

      Problem: ${problem.title}
      Problem description: ${problem.description}
      Reference solution: ${problem.solution}

      Student's ${language} code:
      \`\`\`${language}
      ${code}
      \`\`\`

      Time taken: ${timeTaken} seconds
      Number of attempts: ${attemptsCount}

      Evaluate:
      1. Is the solution correct? (functionally correct, handles edge cases)
      2. If wrong, classify the mistake into EXACTLY one of these patterns:
         - off_by_one (loop boundary errors)
         - null_check_missing (not handling null/None/empty input)
         - wrong_base_case (incorrect recursion termination)
         - wrong_algorithm (fundamentally wrong approach)
         - visited_not_marked (graph traversal missing visited tracking)
      3. Generate feedback in the appropriate tone for the explanation mode.
      4. In complex mode only: provide time and space complexity of the student's solution.

      Respond ONLY with valid JSON:
      {
        "correct": true or false,
        "feedback": "feedback string adapted to explanation mode",
        "mistakePattern": "pattern name or null if correct",
        "timeComplexity": "O(n) or null if simple mode",
        "spaceComplexity": "O(1) or null if simple mode"
      }
    `;

    const { result: aiRaw, source } = await withFallback(
      () => ollamaChatJSON([{ role: 'user', content: prompt }]),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_FAST,
          messages: [
            { role: 'system', content: `${persona} You are a DSA tutor evaluating student code.` },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(prompt),
      JSON.stringify({ correct: false, feedback: 'Could not evaluate right now. Please try again.', mistakePattern: null, timeComplexity: null, spaceComplexity: null })
    );

    console.log(`[/api/evaluate] AI source: ${source}`);

    let result: any;
    try {
      result = JSON.parse(aiRaw);
    } catch {
      result = { correct: false, feedback: 'Evaluation parsing failed. Please try again.', mistakePattern: null };
    }

    if (result.mistakePattern && !VALID_MISTAKE_PATTERNS.includes(result.mistakePattern)) {
      result.mistakePattern = null;
    }

    const delta = calculateConfidenceDelta(result.correct, timeTaken ?? 300, attemptsCount ?? 1);
    await updateConfidence(sessionId, problem.topic, delta);

    await supabaseServer.from('problem_attempts').insert({
      session_id: sessionId,
      problem_id: problemId,
      topic: problem.topic,
      attempts_count: attemptsCount ?? 1,
      time_taken_seconds: timeTaken ?? 0,
      final_status: result.correct ? 'solved' : 'in_progress',
      mistake_pattern: result.mistakePattern ?? null,
    });

    if (result.mistakePattern) {
      const { data: patternHistory } = await supabaseServer
        .from('problem_attempts')
        .select('mistake_pattern')
        .eq('session_id', sessionId)
        .eq('mistake_pattern', result.mistakePattern);

      if (patternHistory && patternHistory.length >= 3) {
        result.recurringPattern = true;
        result.recurringPatternMessage = `You've made the "${result.mistakePattern}" mistake ${patternHistory.length} times. Let's focus on fixing this mental model.`;
      }
    }

    return NextResponse.json({
      ...result,
      confidenceUpdate: { topic: problem.topic, delta },
      ai_source: source,
    });

  } catch (error: any) {
    console.error('[/api/evaluate] Unhandled error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}