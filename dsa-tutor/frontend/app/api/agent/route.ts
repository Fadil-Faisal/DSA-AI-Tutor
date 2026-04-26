import { NextRequest, NextResponse } from 'next/server';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface AgentRequest {
  problemId: string;
  problemTitle: string;
  problemTopic: string;
  code: string;
  correct: boolean;
  timeTaken: number;  // seconds
  hintsUsed: number;
  attemptCount: number;
  confidence: Record<string, number>;
  explanationMode: 'simple' | 'complex';
  problemIndex: number; // 0-based, which demo problem we're on
}

interface AgentResponse {
  reasoning: string;
  feedback: string;
  decisionType: string;
  confidenceUpdate: { topic: string; delta: number } | null;
  nextProblemIndex: number;
  providerUsed: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// System prompt — this is what makes it an AGENT, not a chatbot
// ──────────────────────────────────────────────────────────────────────────────
function buildSystemPrompt(): string {
  return `You are an Adaptive DSA Tutor Agent — not a chatbot.

Your job is to build a cognitive model of the student and autonomously decide:
1. What to tell them about their answer
2. How to update your belief about their skill level
3. What to teach them next

You receive a snapshot of the student's current performance. You must respond with ONLY valid JSON (no markdown, no explanation, just the JSON object).

Response schema:
{
  "reasoning": "Your internal chain-of-thought about what this student knows and what they need. 2-3 sentences. This is shown to the student as a transparent window into your thinking.",
  "feedback": "Direct, specific feedback on their answer. 1-2 sentences. Be a tough but fair coach.",
  "decisionType": "one of: next_problem | reinforce | give_hint | struggling",
  "confidenceUpdate": { "topic": "arrays|strings|recursion|dp|trees|graphs|sorting|searching|heaps|linked_lists", "delta": number between -0.15 and +0.15 },
  "nextProblemIndex": number (0, 1, or 2 — the index of the next problem to show)
}

Decision rules:
- If correct AND fast (< 90s) AND no hints → decisionType: "next_problem", positive delta (+0.08 to +0.12)
- If correct AND slow (> 120s) OR used hints → decisionType: "reinforce", small positive delta (+0.03 to +0.06)  
- If wrong AND first attempt → decisionType: "give_hint", small negative delta (-0.03 to -0.05)
- If wrong AND multiple attempts → decisionType: "struggling", larger negative delta (-0.08 to -0.12)

For nextProblemIndex: progress linearly (0→1→2) on correct, stay on same or go back on wrong.`;
}

function buildUserPrompt(req: AgentRequest): string {
  const topicConfidences = Object.entries(req.confidence)
    .map(([k, v]) => `${k}: ${Math.round(v * 100)}%`)
    .join(', ');

  return `Student performance snapshot:
- Problem: "${req.problemTitle}" (topic: ${req.problemTopic}, index: ${req.problemIndex}/2)
- Result: ${req.correct ? 'CORRECT ✓' : 'WRONG ✗'}
- Time taken: ${req.timeTaken}s
- Hints used: ${req.hintsUsed}
- Attempt #${req.attemptCount} on this problem
- Explanation mode: ${req.explanationMode}
- Current confidence scores: ${topicConfidences}
- Code submitted:
\`\`\`python
${req.code.slice(0, 400)}
\`\`\`

Respond with ONLY the JSON object. No markdown, no code blocks around the JSON.`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider: Ollama (local, primary)
// ──────────────────────────────────────────────────────────────────────────────
async function callOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3';

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      format: 'json',
      options: { temperature: 0.3, num_predict: 512 },
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider: Groq (fallback 1)
// ──────────────────────────────────────────────────────────────────────────────
async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
      response_format: { type: 'json_object' },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${res.status} — ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider: Gemini (fallback 2)
// ──────────────────────────────────────────────────────────────────────────────
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} — ${err}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ──────────────────────────────────────────────────────────────────────────────
// Parse + validate the AI response
// ──────────────────────────────────────────────────────────────────────────────
function parseAgentResponse(raw: string, req: AgentRequest): AgentResponse & { providerUsed: string } {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);

  // Clamp nextProblemIndex to valid range
  const maxIndex = 2;
  let nextIndex = typeof parsed.nextProblemIndex === 'number'
    ? Math.max(0, Math.min(maxIndex, parsed.nextProblemIndex))
    : req.problemIndex;

  // Safety: never go backwards on correct, never advance on wrong
  if (req.correct && nextIndex <= req.problemIndex) nextIndex = Math.min(maxIndex, req.problemIndex + 1);
  if (!req.correct) nextIndex = req.problemIndex;

  return {
    reasoning: parsed.reasoning || 'Analyzing your performance…',
    feedback: parsed.feedback || (req.correct ? 'Good work!' : 'Not quite — try again.'),
    decisionType: parsed.decisionType || (req.correct ? 'next_problem' : 'give_hint'),
    confidenceUpdate: parsed.confidenceUpdate || null,
    nextProblemIndex: nextIndex,
    providerUsed: '', // filled by caller
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Main route handler
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: AgentRequest = await request.json();
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(body);

    // Try providers in order: Ollama → Groq → Gemini
    const providers: Array<{ name: string; fn: () => Promise<string> }> = [
      { name: 'Ollama', fn: () => callOllama(systemPrompt, userPrompt) },
      { name: 'Groq', fn: () => callGroq(systemPrompt, userPrompt) },
      { name: 'Gemini', fn: () => callGemini(systemPrompt, userPrompt) },
    ];

    let lastError: Error | null = null;
    for (const provider of providers) {
      try {
        console.log(`[Agent] Trying ${provider.name}…`);
        const raw = await provider.fn();
        const result = parseAgentResponse(raw, body);
        result.providerUsed = provider.name;
        console.log(`[Agent] Success via ${provider.name}. Decision: ${result.decisionType}`);
        return NextResponse.json(result);
      } catch (err) {
        lastError = err as Error;
        console.warn(`[Agent] ${provider.name} failed: ${lastError.message}`);
      }
    }

    // All providers failed — return a safe fallback response
    console.error('[Agent] All providers failed. Using hardcoded fallback.');
    const fallback: AgentResponse = {
      reasoning: body.correct
        ? `You got "${body.problemTitle}" correct in ${body.timeTaken}s. My confidence model for your ${body.problemTopic} skill has been updated.`
        : `You struggled with "${body.problemTitle}". That's okay — this is how we learn. I'm keeping you on this problem.`,
      feedback: body.correct
        ? 'Great job! Moving to the next challenge.'
        : 'Not quite. Review the hints and try again — you\'re closer than you think.',
      decisionType: body.correct ? 'next_problem' : 'give_hint',
      confidenceUpdate: {
        topic: body.problemTopic,
        delta: body.correct ? 0.08 : -0.05,
      },
      nextProblemIndex: body.correct
        ? Math.min(2, body.problemIndex + 1)
        : body.problemIndex,
      providerUsed: 'fallback',
    };
    return NextResponse.json(fallback);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
