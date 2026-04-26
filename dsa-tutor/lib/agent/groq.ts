// lib/agent/groq.ts
// Fallback 1 — Groq API. Used when Ollama is down or times out.
// Groq is OpenAI API-compatible. We use the openai package.

import OpenAI from 'openai';

let _groq: OpenAI | undefined;

export const getGroq = (): OpenAI => {
  if (!_groq) {
    _groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || 'placeholder',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return _groq;
};

export const groq = {
  get chat() { return getGroq().chat; },
  get models() { return getGroq().models; },
};

// Fast model — for evaluate + hints (latency-sensitive)
export const GROQ_FAST = 'llama-3.1-8b-instant';

// Powerful model — for reasoning panel, complex decisions
export const GROQ_STRONG = 'llama-3.3-70b-versatile';