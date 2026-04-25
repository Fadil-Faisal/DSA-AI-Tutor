// app/api/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_FAST } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';
import { supabaseServer } from '@/lib/supabase/server';
import { calculateConfidenceDelta, updateConfidence } from '@/lib/agent/confidence';

const JUDGE0_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || 'https://ce.judge0.com';

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
};

interface TestCase {
  input: string;
  expected: string;
}

async function executeCode(
  sourceCode: string,
  languageId: number,
  stdin: string,
  expectedOutput: string
): Promise<{ stdout: string; time: string; memory: number; status: { id: number; description: string } }> {
  const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: Buffer.from(sourceCode).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(stdin).toString('base64'),
      expected_output: Buffer.from(expectedOutput).toString('base64'),
    }),
  });

  const data = await response.json();
  return {
    stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString() : '',
    time: data.time || '0',
    memory: data.memory || 0,
    status: data.status,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, problemId, code, language, explanationMode, timeTaken, attemptsCount } = await req.json();

    if (!sessionId || !problemId || !code || !language || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const langId = LANGUAGE_IDS[language.toLowerCase()];
    if (!langId) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    const { data: problem, error: problemError } = await supabaseServer
      .from('problems_bank')
      .select('*')
      .eq('id', problemId)
      .single();

    if (problemError || !problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const examples = problem.examples as TestCase[] | null;
    if (!examples || examples.length === 0) {
      return NextResponse.json({ error: 'No test cases found for problem' }, { status: 400 });
    }

    const testCases: Array<{ input: string; expected: string }> = examples.map((ex: { input?: string; output?: string }) => ({
      input: ex.input || '',
      expected: ex.output || '',
    }));

    const results: Array<{ input: string; expected: string; actual: string; passed: boolean; time?: string; memory?: number; status?: string; error?: string }> = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const result = await executeCode(code, langId, testCase.input, testCase.expected);
        const actual = result.stdout.trim();
        const expected = testCase.expected.trim();
        const passed = actual === expected;

        if (!passed) allPassed = false;

        results.push({
          input: testCase.input,
          expected,
          actual,
          passed,
          time: result.time,
          memory: result.memory,
          status: result.status.description,
        });
      } catch (e) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: 'Execution error',
          passed: false,
          error: (e as Error).message,
        });
        allPassed = false;
      }
    }

    const isCorrect = allPassed;

    if (isCorrect) {
      const persona = getModePersona(explanationMode);
      const feedbackPrompt = `
        ${persona}

        The student's code passed all test cases. Generate an encouraging congratulations message.
        In simple mode: Celebrate! Use kid-friendly language.
        In complex mode: Mention time/space complexity and potential optimizations.

        Student's code:
        ${code}

        Respond ONLY with valid JSON:
        { "feedback": "your message here" }
      `;

      const { result: feedbackRaw } = await withFallback(
        () => ollamaChatJSON(persona, feedbackPrompt),
        async () => {
          const completion = await groq.chat.completions.create({
            model: GROQ_FAST,
            messages: [{ role: 'user', content: feedbackPrompt }],
            response_format: { type: 'json_object' },
          });
          return completion.choices[0].message.content!;
        },
        () => geminiChat(feedbackPrompt),
        JSON.stringify({ feedback: 'Congratulations! You solved it!' })
      );

      let feedbackJson: { feedback: string; hint?: string };
      try {
        feedbackJson = JSON.parse(feedbackRaw);
      } catch {
        feedbackJson = { feedback: 'Great job! All tests passed!' };
      }

      const delta = calculateConfidenceDelta(true, timeTaken ?? 300, attemptsCount ?? 1);
      await updateConfidence(sessionId, problem.topic, delta);

      await supabaseServer.from('problem_attempts').insert({
        session_id: sessionId,
        problem_id: problemId,
        topic: problem.topic,
        attempts_count: attemptsCount ?? 1,
        time_taken_seconds: timeTaken ?? 0,
        final_status: 'solved',
        mistake_pattern: null,
      });

      return NextResponse.json({
        success: true,
        correct: true,
        results,
        feedback: feedbackJson.feedback,
        confidenceUpdate: { topic: problem.topic, delta },
      });
    }

    const persona = getModePersona(explanationMode);
    const evalPrompt = `
      ${persona}

      The code failed one or more test cases. Analyze what went wrong.

      Problem: ${problem.title}
      Student's code:
      ${code}

      Test results:
      ${JSON.stringify(results, null, 2)}

      In simple mode: Explain what's wrong using simple terms and everyday examples.
      In complex mode: Identify the bug, suggest a fix, and mention complexity implications.

      Respond ONLY with valid JSON:
      { "feedback": "explanation of the bug", "hint": "one sentence hint" }
    `;

    const { result: evalRaw, source } = await withFallback(
      () => ollamaChatJSON(persona, evalPrompt),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_FAST,
          messages: [{ role: 'user', content: evalPrompt }],
          response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(evalPrompt),
      JSON.stringify({ feedback: 'Some tests failed. Check your logic.', hint: 'Review the failed test case.' })
    );

    let evalJson: { feedback: string; hint: string };
    try {
      evalJson = JSON.parse(evalRaw);
    } catch {
      evalJson = { feedback: 'Some tests failed.', hint: 'Check the failed test case.' };
    }

    const delta = calculateConfidenceDelta(false, timeTaken ?? 300, attemptsCount ?? 1);
    await updateConfidence(sessionId, problem.topic, delta);

    await supabaseServer.from('problem_attempts').insert({
      session_id: sessionId,
      problem_id: problemId,
      topic: problem.topic,
      attempts_count: attemptsCount ?? 1,
      time_taken_seconds: timeTaken ?? 0,
      final_status: 'in_progress',
      mistake_pattern: null,
    });

    return NextResponse.json({
      success: false,
      correct: false,
      results,
      feedback: evalJson.feedback,
      hint: evalJson.hint,
      confidenceUpdate: { topic: problem.topic, delta },
      ai_source: source,
    });

  } catch (error: unknown) {
    console.error('[/api/run] Error:', error);
    return NextResponse.json({ error: 'Execution failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}