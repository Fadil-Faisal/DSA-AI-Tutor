// app/api/interview/route.ts
// Generates follow-up interview questions and manages interview session state.

import { NextRequest, NextResponse } from 'next/server';
import { ollamaChat } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';

export async function POST(req: NextRequest) {
  try {
    const { problemTitle, problemTopic, studentCode, explanationMode, stage } = await req.json();

    if (!problemTitle || !explanationMode || !stage) {
      return NextResponse.json({ error: 'Missing required fields: problemTitle, explanationMode, stage' }, { status: 400 });
    }
    if (!['simple', 'complex'].includes(explanationMode)) {
      return NextResponse.json({ error: 'Invalid explanationMode' }, { status: 400 });
    }

    const persona = getModePersona(explanationMode);

    // Stage 1: Initial follow-up question after solution is submitted
    // Stage 2: Deeper technical follow-up
    // Stage 3: Edge case and optimization question
    const stageInstructions: Record<string, string> = {
      '1': 'Ask the student to explain their approach in plain English. Do not ask about complexity yet.',
      '2': 'Ask about the time and space complexity of their solution and whether they can optimize it.',
      '3': 'Ask about a specific edge case they might have missed, or how they would handle a variation of the problem.',
    };

    const prompt = `
      ${persona}

      You are conducting a technical interview. The student just submitted a solution.

      Problem: ${problemTitle} (Topic: ${problemTopic ?? 'DSA'})
      Student code submitted: ${studentCode ? 'yes' : 'no'}
      Interview stage: ${stage} of 3
      Stage goal: ${stageInstructions[stage] ?? stageInstructions['1']}

      Generate ONE follow-up interview question appropriate for this stage.
      In simple mode: be encouraging, use plain language.
      In complex mode: be direct and technical, like a FAANG interviewer.

      Respond with just the question — no preamble, no JSON, just the question text.
    `;

    const { result: question, source } = await withFallback(
      () => ollamaChat(prompt),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_STRONG,
          messages: [{ role: 'user', content: prompt }],
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(prompt),
      'Can you walk me through your approach to solving this problem?'
    );

    console.log(`[/api/interview] AI source: ${source}`);

    return NextResponse.json({ question: question.trim(), stage, ai_source: source });

  } catch (error: unknown) {
    console.error('[/api/interview] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}