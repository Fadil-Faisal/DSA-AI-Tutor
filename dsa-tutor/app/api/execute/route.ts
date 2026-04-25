// app/api/execute/route.ts
// Proxies code execution to Judge0 CE (free public instance, no API key needed).
// Supports Python, Java, C++, and JavaScript.

import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || 'https://ce.judge0.com';

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  java: 62,
  cpp: 54,
  javascript: 63,
};

// Judge0 status IDs
const STATUS = {
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILE_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 11,
};

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Judge0Result {
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const { code, language, testCases } = await req.json();

    // Validate
    if (!code || !language || !testCases) {
      return NextResponse.json({ error: 'Missing required fields: code, language, testCases' }, { status: 400 });
    }
    if (!LANGUAGE_IDS[language]) {
      return NextResponse.json({ error: `Invalid language. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}` }, { status: 400 });
    }
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json({ error: 'testCases must be a non-empty array' }, { status: 400 });
    }
    if (testCases.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 test cases per request (Judge0 free tier limit)' }, { status: 400 });
    }

    const languageId = LANGUAGE_IDS[language];

    // Run all test cases in parallel
    const results = await Promise.allSettled(
      testCases.map(async (tc: TestCase) => {
        const response = await fetch(
          `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source_code: code,
              language_id: languageId,
              stdin: tc.input,
              expected_output: tc.expectedOutput,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Judge0 returned ${response.status}`);
        }

        return response.json() as Promise<Judge0Result>;
      })
    );

    const processed = results.map((result, i) => {
      if (result.status === 'rejected') {
        return {
          testCase: i + 1,
          passed: false,
          error: 'Execution service unavailable. Try again.',
          stdout: null,
          stderr: null,
          compile_output: null,
          time: null,
          status: 'Service Error',
        };
      }

      const r = result.value;
      return {
        testCase: i + 1,
        passed: r.status.id === STATUS.ACCEPTED,
        stdout: r.stdout?.trim() ?? null,
        stderr: r.stderr?.trim() ?? null,
        compile_output: r.compile_output?.trim() ?? null,
        time: r.time ?? null,
        memory: r.memory ?? null,
        status: r.status.description,
      };
    });

    const allPassed = processed.every(r => r.passed);
    const passedCount = processed.filter(r => r.passed).length;

    return NextResponse.json({
      results: processed,
      summary: {
        allPassed,
        passedCount,
        totalCount: testCases.length,
      },
    });

  } catch (error: unknown) {
    console.error('[/api/execute] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}