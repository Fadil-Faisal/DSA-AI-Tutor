// app/api/hint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_FAST } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';
import { supabaseServer } from '@/lib/supabase/server';

const HINT_LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'A small directional nudge — do NOT reveal the approach or algorithm. Simple mode: use a real-world analogy. Complex mode: mention the relevant data structure category.',
  2: 'Reveal the high-level strategy — no code. Simple mode: step-by-step explanation with everyday example. Complex mode: name the algorithm and explain why it applies, include complexity hint.',
  3: 'Near-complete pseudocode — close to the solution but not runnable. Simple mode: written like plain English instructions. Complex mode: proper pseudocode with loop/condition structure.',
};

export async function POST(req: NextRequest) {
  try {
    const { sessionId, problemId, hintLevel, explanationMode, currentCode, mistakePattern } = await req.json();

    if (!problemId || !hintLevel || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields: problemId, hintLevel, explanationMode' }, { status: 400 });
    }
    if (![1, 2, 3].includes(hintLevel)) {
      return NextResponse.json({ error: 'hintLevel must be 1, 2, or 3' }, { status: 400 });
    }
    if (!['simple', 'complex'].includes(explanationMode)) {
      return NextResponse.json({ error: 'Invalid explanationMode' }, { status: 400 });
    }

    const { data: problem, error } = await supabaseServer
      .from('problems_bank')
      .select('hints, solution, title, description')
      .eq('id', problemId)
      .single();

    if (error || !problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const hints = problem.hints as string[] | null;
    if (hints && hints[hintLevel - 1] && !mistakePattern) {
      if (sessionId) {
        await supabaseServer
          .from('problem_attempts')
          .update({ hints_used: hintLevel })
          .eq('session_id', sessionId)
          .eq('problem_id', problemId);
      }
      return NextResponse.json({ hint: hints[hintLevel - 1], source: 'prewritten' });
    }

    const persona = getModePersona(explanationMode);
    const prompt = `
      ${persona}

      You are generating a Level ${hintLevel} hint for a DSA problem.

      Problem: ${problem.title}
      Description: ${problem.description}
      Student's current code: ${currentCode ?? 'not provided'}
      Known mistake pattern: ${mistakePattern ?? 'none'}

      Hint Level ${hintLevel} instruction:
      ${HINT_LEVEL_DESCRIPTIONS[hintLevel]}

      Rules:
      - Do NOT give away the full solution
      - Target the hint to the known mistake pattern if one is provided
      - Keep the hint concise — 3-5 sentences max for level 1 and 2, 10-15 lines max for level 3

      Respond ONLY with valid JSON:
      { "hint": "the hint text here" }
    `;

    const { result: aiRaw, source } = await withFallback(
      () => ollamaChatJSON(persona, prompt),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_FAST,
          messages: [
            { role: 'system', content: `${persona} Generate a Level ${hintLevel} hint.` },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(prompt),
      JSON.stringify({ hint: 'Think carefully about the approach. Try breaking the problem into smaller steps.' })
    );

    console.log(`[/api/hint] AI source: ${source}`);

    let parsed: { hint: string };
    try {
      parsed = JSON.parse(aiRaw);
    } catch {
      parsed = { hint: 'Try breaking the problem into smaller steps.' };
    }

    if (sessionId) {
      await supabaseServer
        .from('problem_attempts')
        .update({ hints_used: hintLevel })
        .eq('session_id', sessionId)
        .eq('problem_id', problemId);
    }

    return NextResponse.json({ hint: parsed.hint, source: `ai_${source}` });

} catch (error: unknown) {
    console.error('[/api/hint] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}