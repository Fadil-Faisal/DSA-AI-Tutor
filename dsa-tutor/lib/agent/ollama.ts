// lib/agent/ollama.ts
// Primary AI — Ollama running locally. Free, unlimited, no rate limits.

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function ollamaChat(
  messages: OllamaChatMessage[],
  timeoutMs: number = 8000
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.message?.content ?? '';
  } finally {
    clearTimeout(timer);
  }
}

// For routes that need JSON — wraps the prompt to enforce JSON output
export async function ollamaChatJSON(
  messages: OllamaChatMessage[],
  timeoutMs: number = 8000
): Promise<string> {
  // Add JSON enforcement to the last user message
  const enforced = [...messages];
  const last = enforced[enforced.length - 1];
  enforced[enforced.length - 1] = {
    ...last,
    content: last.content + '\n\nIMPORTANT: Respond ONLY with valid JSON. No explanation, no markdown, no code fences.',
  };
  return ollamaChat(enforced, timeoutMs);
}