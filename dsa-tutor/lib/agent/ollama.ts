// lib/agent/ollama.ts
// Primary AI — local Ollama instance running phi3:latest
// phi3 is Microsoft's 3.8B parameter model — fast, lightweight, good at reasoning
// Ollama exposes an OpenAI-compatible API at /v1/

import OpenAI from 'openai';

let _ollama: OpenAI | undefined;

export const getOllama = (): OpenAI => {
  if (!_ollama) {
    _ollama = new OpenAI({
      apiKey: process.env.OLLAMA_API_KEY || 'ollama',
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
    });
  }
  return _ollama;
};

export const ollama = {
  get chat() { return getOllama().chat; },
  get models() { return getOllama().models; },
};

export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'phi3:latest';

// ─── IMPORTANT: phi3 JSON safety wrapper ───────────────────────────────────
// phi3 is a small model (3.8B params). It sometimes wraps JSON in markdown
// code fences like ```json { ... } ``` instead of returning raw JSON.
// This helper strips those fences so JSON.parse() never crashes.
function extractJSON(raw: string): string {
  // Remove markdown code fences if present
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Find first { or [ and return from there
  const jsonStart = raw.search(/[{[]/);
  if (jsonStart !== -1) return raw.slice(jsonStart).trim();
  return raw.trim();
}

// Simple chat — use when you just need a text response (hints, feedback)
export async function ollamaChat(prompt: string): Promise<string> {
  const completion = await ollama.chat.completions.create({
    model: OLLAMA_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });
  return completion.choices[0].message.content ?? '';
}

// JSON chat — use when the route needs structured JSON output
// Adds extra instruction to ensure phi3 returns raw JSON
export async function ollamaChatJSON(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const completion = await ollama.chat.completions.create({
    model: OLLAMA_MODEL,
    messages: [
      {
        role: 'system',
        // Extra instruction helps phi3 stay on raw JSON output
        content: systemPrompt + '\n\nCRITICAL: Respond ONLY with raw JSON. No markdown, no code fences, no explanation. Just the JSON object.',
      },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2, // Low temp = more consistent JSON from small models
  });

  const raw = completion.choices[0].message.content ?? '{}';
  return extractJSON(raw); // Strip any markdown fences phi3 might add
}

// Health check — call this on startup to verify Ollama is reachable
export async function ollamaHealthCheck(): Promise<boolean> {
  try {
    const models = await ollama.models.list();
    const hasPhi3 = models.data.some(m => m.id.includes('phi3'));
    if (!hasPhi3) {
      console.warn('[Ollama] phi3:latest not found. Run: ollama pull phi3');
    }
    return true;
  } catch {
    console.error('[Ollama] Not reachable at', process.env.OLLAMA_BASE_URL);
    return false;
  }
}