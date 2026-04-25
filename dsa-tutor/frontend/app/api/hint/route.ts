import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/hint
 *
 * Uses Groq (fast) to generate progressive hints.
 * hintLevel: 1 = nudge, 2 = approach, 3 = pseudocode
 *
 * Request body:
 * {
 *   sessionId: string;
 *   problemId: string;
 *   hintLevel: 1 | 2 | 3;
 *   explanationMode: 'simple' | 'complex';
 *   code?: string;
 * }
 *
 * Response:
 * {
 *   hint: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, problemId, hintLevel, explanationMode } = body;

    if (!sessionId || !problemId || !hintLevel || !explanationMode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (![1, 2, 3].includes(hintLevel)) {
      return NextResponse.json({ error: 'hintLevel must be 1, 2, or 3' }, { status: 400 });
    }

    // TODO: Implement with Groq API
    // Build prompt with explanationMode persona (simple/complex)
    // Groq llama-3.1-8b-instant for speed

    const stubs = {
      1: 'Think about what data structure lets you look up values in O(1) time.',
      2: 'Use a hash map to store each number and its index as you iterate.',
      3: 'for each num at index i:\n  complement = target - num\n  if complement in seen:\n    return [seen[complement], i]\n  seen[num] = i',
    };

    return NextResponse.json({ hint: stubs[hintLevel as 1 | 2 | 3] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
