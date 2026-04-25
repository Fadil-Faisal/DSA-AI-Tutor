import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/evaluate
 * 
 * Called after the user submits code.
 * Uses Groq (fast) to evaluate correctness and give feedback.
 *
 * Request body:
 * {
 *   sessionId: string;
 *   problemId: string;
 *   code: string;
 *   language: 'python' | 'javascript' | 'java' | 'cpp';
 *   explanationMode: 'simple' | 'complex';
 * }
 *
 * Response:
 * {
 *   correct: boolean;
 *   feedback: string;
 *   updatedConfidence: Record<string, number>;
 *   decisionType: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, problemId, code, language, explanationMode } = body;

    if (!sessionId || !problemId || !code || !language || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Implement with Groq API
    // 1. Run code via Judge0
    // 2. Pass result + code to Groq for evaluation
    // 3. Update learner confidence in Supabase
    // 4. Return feedback in correct explanationMode style

    // Stub response for demo
    return NextResponse.json({
      correct: code.includes('seen') || code.includes('{}'),
      feedback: 'Great use of hash map! This achieves O(n) time complexity.',
      updatedConfidence: {},
      decisionType: 'next_problem',
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
