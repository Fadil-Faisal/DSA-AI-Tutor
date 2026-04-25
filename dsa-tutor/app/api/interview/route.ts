// app/api/interview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { supabaseServer } from '@/lib/supabase/server';

const COMPANY_QUESTIONS: Record<string, string[]> = {
  google: [
    'Explain the difference between BFS and DFS. When would you use each?',
    'How would you design a rate limiter?',
    'Explain MapReduce.',
    'How do you handle missing keys in a hash map?',
    'Design a URL shortener.',
  ],
  amazon: [
    'Explain the concept of eventual consistency.',
    'How would you design a recommendation system?',
    'Design an elevator system for a building.',
    'Explain CAP theorem.',
    'How would you handle high traffic spikes?',
  ],
  meta: [
    'Design a chat system like WhatsApp.',
    'Explain the news feed ranking algorithm.',
    'How would you optimize a slow database query?',
    'Design a friend suggestion system.',
    'Explain load balancing strategies.',
  ],
  microsoft: [
    'Design a parking lot system.',
    'Explain virtual memory.',
    'How would you implement undo/redo?',
    'Design a file system.',
    'Explain deadlock detection.',
  ],
  apple: [
    'How would you optimize app startup time?',
    'Explain the iOS memory management model.',
    'Design a music streaming system.',
    'How would you handle offline-first sync?',
    'Explain animation performance optimization.',
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { sessionId, company, mode, conversationHistory } = await req.json();

    if (!sessionId || !company) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, company' }, { status: 400 });
    }

    const targetCompany = company.toLowerCase();
    if (!COMPANY_QUESTIONS[targetCompany]) {
      return NextResponse.json({ error: `Unknown company: ${company}. Supported: google, amazon, meta, microsoft, apple` }, { status: 400 });
    }

    if (mode === 'answer_check') {
      const { studentAnswer, question } = await req.json();
      
      if (!studentAnswer || !question) {
        return NextResponse.json({ error: 'Missing fields for answer_check' }, { status: 400 });
      }

      const prompt = `
        You are a senior software engineer at ${company} conducting a mock technical interview.

        Question: ${question}
        Student's answer: ${studentAnswer}

        Evaluate:
        1. Is the answer technically accurate?
        2. Is it complete (covers all aspects)?
        3. Is it well-structured?
        4. Did they ask clarifying questions?

        Respond ONLY with valid JSON:
        {
          "score": 1-10,
          "strengths": ["list of what they did well"],
          "improvements": ["list of areas to improve"],
          "feedback": "2-3 sentence constructive feedback"
        }
      `;

      const { result: evalRaw, source } = await withFallback(
        () => ollamaChatJSON([{ role: 'user', content: prompt }]),
        async () => {
          const completion = await groq.chat.completions.create({
            model: GROQ_STRONG,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
          });
          return completion.choices[0].message.content!;
        },
        () => geminiChat(prompt),
        JSON.stringify({ score: 5, strengths: [], improvements: [], feedback: 'Please provide more details.' })
      );

      let evalJson: any;
      try {
        evalJson = JSON.parse(evalRaw);
      } catch {
        evalJson = { score: 5, strengths: [], improvements: [], feedback: 'Could not evaluate.' };
      }

      return NextResponse.json({
        question,
        evaluation: evalJson,
        ai_source: source,
      });
    }

    const prompt = `
      You are a mock interviewer at ${company}. The student is practicing for a technical interview.

      Previous conversation:
      ${JSON.stringify(conversationHistory || [])}

      Ask ONE follow-up question based on their previous answer. Keep it natural and conversational.
      Ask deeper questions about their implementation, edge cases, time/space complexity, or tradeoffs.

      Respond ONLY with valid JSON:
      { "question": "your question here", "context": "brief context for why you asked this" }
    `;

    const { result: qRaw, source } = await withFallback(
      () => ollamaChatJSON([{ role: 'user', content: prompt }]),
      async () => {
        const completion = await groq.chat.completions.create({
          model: GROQ_STRONG,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
        });
        return completion.choices[0].message.content!;
      },
      () => geminiChat(prompt),
      JSON.stringify({ question: COMPANY_QUESTIONS[targetCompany][0], context: 'Random question' })
    );

    let qJson: any;
    try {
      qJson = JSON.parse(qRaw);
    } catch {
      qJson = { question: COMPANY_QUESTIONS[targetCompany][0], context: 'Random question' };
    }

    return NextResponse.json({
      question: qJson.question,
      context: qJson.context,
      availableQuestions: COMPANY_QUESTIONS[targetCompany],
      ai_source: source,
    });

  } catch (error: any) {
    console.error('[/api/interview] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}