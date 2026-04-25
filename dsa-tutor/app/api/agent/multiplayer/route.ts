// app/api/agent/multiplayer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';

export async function POST(req: NextRequest) {
  try {
    const { roomId, playerOneSessionId, playerTwoSessionId, explanationMode } = await req.json();

    if (!roomId || !playerOneSessionId || !playerTwoSessionId || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validModes = ['simple', 'complex'];
    if (!validModes.includes(explanationMode)) {
      return NextResponse.json({ error: 'Invalid explanationMode' }, { status: 400 });
    }

    const { data: room } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const { data: profile1 } = await supabaseServer
      .from('learner_profiles')
      .select('*')
      .eq('session_id', playerOneSessionId)
      .single();

    const { data: profile2 } = await supabaseServer
      .from('learner_profiles')
      .select('*')
      .eq('session_id', playerTwoSessionId)
      .single();

    const confidence1 = profile1 ? {
      arrays: profile1.arrays_confidence,
      trees: profile1.trees_confidence,
      graphs: profile1.graphs_confidence,
      dp: profile1.dp_confidence,
      recursion: profile1.recursion_confidence,
    } : {};

    const confidence2 = profile2 ? {
      arrays: profile2.arrays_confidence,
      trees: profile2.trees_confidence,
      graphs: profile2.graphs_confidence,
      dp: profile2.dp_confidence,
      recursion: profile2.recursion_confidence,
    } : {};

    const persona = getModePersona(explanationMode);

    const prompt = `
      ${persona}

      You are an AI tutor managing a multiplayer DSA session.
      Room mode: ${room.mode}
      Player One confidence: ${JSON.stringify(confidence1)}
      Player Two confidence: ${JSON.stringify(confidence2)}

      In collaborative mode: pick a topic where BOTH players need improvement (average lowest confidence).
      In battle mode: pick a topic based on the WEAKER player's lowest confidence so the game stays competitive.

      Explain in 2 sentences why this problem was chosen (shown to both players).
      Respond ONLY in JSON: { "topic": string, "difficulty": "Easy"|"Medium"|"Hard", "reasoning": string }
    `;

    const { result: aiRaw } = await withFallback(
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
      JSON.stringify({
        topic: 'arrays',
        difficulty: 'Easy',
        reasoning: 'Both players need practice with arrays.'
      })
    );

    let aiParsed = { topic: 'arrays', difficulty: 'Easy', reasoning: 'Default selection.' };
    try {
      aiParsed = JSON.parse(aiRaw);
    } catch {}

    const { data: problem } = await supabaseServer
      .from('problems_bank')
      .select('*')
      .eq('topic', aiParsed.topic)
      .eq('difficulty', aiParsed.difficulty)
      .limit(1)
      .single();

    if (!problem) {
      return NextResponse.json({ error: 'No problem found' }, { status: 404 });
    }

    await supabaseServer
      .from('rooms')
      .update({ current_problem_id: problem.id })
      .eq('id', roomId);

    await supabaseServer.from('agent_decisions').insert({
      session_id: playerOneSessionId,
      problem_id: problem.id,
      topic: problem.topic,
      difficulty: problem.difficulty,
      reasoning: aiParsed.reasoning,
      explanation_mode: explanationMode,
    });

    await supabaseServer.from('agent_decisions').insert({
      session_id: playerTwoSessionId,
      problem_id: problem.id,
      topic: problem.topic,
      difficulty: problem.difficulty,
      reasoning: aiParsed.reasoning,
      explanation_mode: explanationMode,
    });

    return NextResponse.json({
      problem,
      reasoning: aiParsed.reasoning,
      roomId,
    });

  } catch (error: unknown) {
    console.error('[/api/agent/multiplayer] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}