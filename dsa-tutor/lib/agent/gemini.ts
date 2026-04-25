// lib/agent/gemini.ts
// Fallback 2 — Gemini 1.5 Flash. Last resort when both Ollama and Groq fail.
// Free tier: 1500 req/day, 15 req/min.

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const gemini = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export async function geminiChat(prompt: string): Promise<string> {
  const result = await gemini.generateContent(prompt);
  return result.response.text();
}