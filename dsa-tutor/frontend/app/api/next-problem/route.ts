import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/next-problem
 *
 * Uses Gemini 1.5 Flash for complex reasoning about what problem to show next.
 * Considers learner confidence, recent performance, and target company.
 *
 * Request body:
 * {
 *   sessionId: string;
 *   explanationMode: 'simple' | 'complex';
 *   confidence: Record<string, number>;
 *   solvedProblemIds: string[];
 *   targetCompany?: string;
 * }
 *
 * Response:
 * {
 *   problem: Problem;
 *   agentReasoning: string;
 *   decisionType: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, confidence, explanationMode } = body;

    if (!sessionId || !confidence || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // TODO: Implement with Gemini API
    // 1. Find weakest topic from confidence scores
    // 2. Query Supabase for an unsolved problem in that topic
    // 3. Use Gemini to generate reasoning explanation
    // 4. Return problem + reasoning

    // Stub response
    return NextResponse.json({
      problem: null, // Backend fills this from DB
      agentReasoning: 'Selecting next problem based on your weakest topic…',
      decisionType: 'next_problem',
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
