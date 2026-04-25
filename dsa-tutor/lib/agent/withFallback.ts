// lib/agent/withFallback.ts
// 3-tier AI fallback: Ollama/phi3 → Groq → Gemini

export async function withFallback<T>(
  primary: () => Promise<T>,    // Ollama (phi3:latest — local, free, no rate limits)
  fallback1: () => Promise<T>,  // Groq   (cloud, fast, 14400 req/day free)
  fallback2: () => Promise<T>,  // Gemini (cloud, 1500 req/day free)
  defaultValue: T
): Promise<{ result: T; source: 'ollama' | 'groq' | 'gemini' | 'default' }> {
  // ── Try Ollama first ──────────────────────────────────────────────────────
  try {
    const result = await primary();
    console.log('[AI] ✅ Ollama (phi3:latest) responded successfully');
    return { result, source: 'ollama' };
  } catch (primaryError) {
    console.warn('[AI] ⚠️  Ollama failed — trying Groq...', (primaryError as Error).message);
  }

  // ── Try Groq second ───────────────────────────────────────────────────────
  try {
    const result = await fallback1();
    console.log('[AI] ✅ Groq responded successfully (Ollama was down)');
    return { result, source: 'groq' };
  } catch (fallback1Error) {
    console.warn('[AI] ⚠️  Groq failed — trying Gemini...', (fallback1Error as Error).message);
  }

  // ── Try Gemini last ───────────────────────────────────────────────────────
  try {
    const result = await fallback2();
    console.log('[AI] ✅ Gemini responded successfully (Ollama + Groq were down)');
    return { result, source: 'gemini' };
  } catch (fallback2Error) {
    console.error('[AI] ❌ All 3 AI providers failed. Returning default value.', (fallback2Error as Error).message);
    return { result: defaultValue, source: 'default' };
  }
}