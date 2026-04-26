import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { groq, GROQ_FAST } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { ollamaChatJSON } from '@/lib/agent/ollama';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, problemId, signals, snapshot } = await req.json();

    if (!sessionId || !snapshot) {
      return NextResponse.json({ error: 'Missing sessionId or snapshot' }, { status: 400 });
    }

    if (signals && signals.length > 0) {
      const rows = signals.map((s: { signal_type: string; value: number; metadata?: Record<string, unknown> }) => ({
        session_id: sessionId,
        problem_id: problemId || null,
        signal_type: s.signal_type,
        value: s.value,
        metadata: s.metadata || {},
      }));
      await supabaseServer.from('behavior_signals').insert(rows);
    }

    const { data: lastPrediction } = await supabaseServer
      .from('agent_predictions')
      .select('created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const secondsSinceLastPrediction = lastPrediction
      ? (Date.now() - new Date(lastPrediction.created_at).getTime()) / 1000
      : 9999;

    const significantEvent = signals?.some((s: { signal_type: string }) =>
      ['skip', 'submit', 'hint_request'].includes(s.signal_type)
    );

    if (secondsSinceLastPrediction < 20 && !significantEvent) {
      return NextResponse.json({ prediction: null, message: 'Too soon for new prediction' });
    }

    const prompt = `
You are an AI tutor monitoring a student solving a DSA problem.

Student Performance Snapshot:
- Time on problem: ${snapshot.timeOnProblemSeconds} seconds (${Math.floor(snapshot.timeOnProblemSeconds/60)} min)
- Hint level: ${snapshot.hintLevel}/3
- Code edits/minute: ${snapshot.codeEditsPerMinute}
- Submit attempts: ${snapshot.submitAttempts}
- Test accuracy: ${snapshot.accuracy}% (${snapshot.passedTests}/${snapshot.totalTests} passed)
- Frustration index: ${snapshot.frustrationIndex} (0=calm, 1=frustrated)
- Engagement score: ${snapshot.engagementScore} (0=disengaged, 1=engaged)

Classify state as ONE of: frustrated, in_flow, overconfident, lost, bored

Respond JSON only:
{"predicted_state": "frustrated", "confidence": 0.82, "recommendation": "Offer hint", "explanation": "short reason"}
`;

    const { result: aiRaw, source } = await withFallback(
      () => ollamaChatJSON('You are a student behavior analyst AI.', prompt),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_FAST,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(prompt),
      JSON.stringify({
        predicted_state: 'in_flow',
        confidence: 0.5,
        recommendation: 'Continue with current difficulty',
        explanation: 'Insufficient data to make a confident prediction yet',
      })
    );

    let prediction;
    try {
      prediction = JSON.parse(aiRaw);
    } catch {
      prediction = {
        predicted_state: 'in_flow',
        confidence: 0.5,
        recommendation: 'Continue with current difficulty',
        explanation: 'Could not parse AI response',
      };
    }

    const { data: savedPrediction } = await supabaseServer
      .from('agent_predictions')
      .insert({
        session_id: sessionId,
        predicted_state: prediction.predicted_state,
        confidence: prediction.confidence,
        signals_snapshot: snapshot,
        recommendation: prediction.recommendation,
        explanation: prediction.explanation,
      })
      .select()
      .single();

    return NextResponse.json({
      prediction: {
        ...prediction,
        id: savedPrediction?.id,
        ai_source: source,
        signals_snapshot: snapshot,
      },
    });

  } catch (error: unknown) {
    console.error('[/api/behavior] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}