// app/api/interview/feedback/route.ts
// Generates a full interview performance report using the most capable available AI.

import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';

export async function POST(req: NextRequest) {
  try {
    const { explanationMode, problems, totalTime } = await req.json();

    if (!explanationMode || !problems || !Array.isArray(problems)) {
      return NextResponse.json({ error: 'Missing required fields: explanationMode, problems[]' }, { status: 400 });
    }

    const persona = getModePersona(explanationMode);

    const prompt = `
      ${persona}

      You are generating a final performance report for a mock technical interview session.

      Session summary:
      - Total time: ${totalTime ?? 'unknown'} minutes
      - Problems attempted: ${problems.length}
      - Problems detail: ${JSON.stringify(problems, null, 2)}

      Evaluate the student on:
      1. Time management (did they solve problems in reasonable time?)
      2. Approach quality (did they choose good algorithms?)
      3. Communication (did they explain their thinking clearly in follow-up questions?)

      Generate a complete performance report.
      In simple mode: be warm, encouraging, focus on growth.
      In complex mode: be direct and data-driven, reference specific algorithmic choices.

      Respond ONLY with valid JSON:
      {
        "timeManagementScore": 0-100,
        "approachQualityScore": 0-100,
        "communicationScore": 0-100,
        "overallPercentile": 0-100,
        "feedback": "3-5 paragraph performance analysis in the appropriate mode tone",
        "nextSteps": ["specific improvement area 1", "specific improvement area 2", "specific improvement area 3"],
        "strongTopics": ["topic1", "topic2"],
        "weakTopics": ["topic1", "topic2"]
      }
    `;

    const { result: aiRaw, source } = await withFallback(
      () => ollamaChatJSON([{ role: 'user', content: prompt }]),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_STRONG,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(prompt),
      JSON.stringify({
        timeManagementScore: 70,
        approachQualityScore: 70,
        communicationScore: 70,
        overallPercentile: 60,
        feedback: 'Good effort! Keep practicing.',
        nextSteps: ['Practice dynamic programming', 'Review graph algorithms', 'Work on time complexity analysis'],
        strongTopics: [],
        weakTopics: [],
      })
    );

    console.log(`[/api/interview/feedback] AI source: ${source}`);

    let report: Record<string, unknown>;
    try {
      report = JSON.parse(aiRaw);
    } catch {
      report = { feedback: 'Report generation failed. Please try again.', nextSteps: [] };
    }

    return NextResponse.json({ ...report, ai_source: source });

  } catch (error: unknown) {
    console.error('[/api/interview/feedback] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}