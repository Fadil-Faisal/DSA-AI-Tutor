// lib/agent/withFallback.ts
// 3-tier fallback: Ollama (primary) → Groq (fallback 1) → Gemini (fallback 2)
// If all three fail, returns the defaultValue — never crashes the frontend.

export async function withFallback<T>(
  primary: () => Promise<T>,    // Ollama
  fallback1: () => Promise<T>,  // Groq
  fallback2: () => Promise<T>,  // Gemini
  defaultValue: T
): Promise<{ result: T; source: 'ollama' | 'groq' | 'gemini' | 'default' }> {
  try {
    const result = await primary();
    return { result, source: 'ollama' };
  } catch (e1) {
    console.warn('[AI] Ollama failed, trying Groq:', (e1 as Error).message);
    try {
      const result = await fallback1();
      return { result, source: 'groq' };
    } catch (e2) {
      console.warn('[AI] Groq failed, trying Gemini:', (e2 as Error).message);
      try {
        const result = await fallback2();
        return { result, source: 'gemini' };
      } catch (e3) {
        console.error('[AI] All AI providers failed:', (e3 as Error).message);
        return { result: defaultValue, source: 'default' };
      }
    }
  }
}