// app/api/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';

const JUDGE0_URL = process.env.NEXT_PUBLIC_JUDGE0_URL || 'https://ce.judge0.com';

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
};

interface TestCase {
  input: string;
  expected: string;
}

async function submitCode(
  sourceCode: string,
  languageId: number,
  stdin: string,
  expectedOutput: string
): Promise<{ stdout: string; time: string; memory: number; status: { id: number; description: string } }> {
  const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: Buffer.from(sourceCode).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(stdin).toString('base64'),
      expected_output: Buffer.from(expectedOutput).toString('base64'),
    }),
  });

  const data = await response.json();
  return {
    stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString() : '',
    time: data.time || '0',
    memory: data.memory || 0,
    status: data.status,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { code, language, testCases } = await req.json();

    if (!code || !language || !testCases) {
      return NextResponse.json({ error: 'Missing required fields: code, language, testCases' }, { status: 400 });
    }

    const langId = LANGUAGE_IDS[language.toLowerCase()];
    if (!langId) {
      return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
    }

    const results: any[] = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const result = await submitCode(code, langId, testCase.input, testCase.expected);
        const actual = result.stdout.trim();
        const expected = testCase.expected.trim();
        const passed = actual === expected;

        if (!passed) allPassed = false;

        results.push({
          input: testCase.input,
          expected,
          actual,
          passed,
          time: result.time,
          memory: result.memory,
          status: result.status.description,
        });
      } catch (e) {
        results.push({
          input: testCase.input,
          expected: testCase.expected,
          actual: 'Execution error',
          passed: false,
          error: (e as Error).message,
        });
        allPassed = false;
      }
    }

    return NextResponse.json({
      success: allPassed,
      results,
      summary: {
        total: testCases.length,
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
      },
    });

  } catch (error: any) {
    console.error('[/api/execute] Error:', error);
    return NextResponse.json({ error: 'Execution failed', details: error.message }, { status: 500 });
  }
}