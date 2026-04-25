// app/api/quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    topic: 'arrays',
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: { A: 'O(n)', B: 'O(1)', C: 'O(log n)', D: 'O(n²)' },
    correctOption: 'B'
  },
  {
    id: 'q2',
    topic: 'trees',
    question: 'In a binary search tree, where is the smallest element located?',
    options: { A: 'Leftmost node', B: 'Root node', C: 'Rightmost node', D: 'Any leaf node' },
    correctOption: 'A'
  },
  {
    id: 'q3',
    topic: 'recursion',
    question: 'What is always required to prevent infinite recursion?',
    options: { A: 'A return statement', B: 'A loop inside the function', C: 'A base case', D: 'A global variable' },
    correctOption: 'C'
  },
  {
    id: 'q4',
    topic: 'graphs',
    question: 'Which algorithm is best for finding the shortest path in an unweighted graph?',
    options: { A: 'DFS', B: 'BFS', C: "Dijkstra's", D: 'Bellman-Ford' },
    correctOption: 'B'
  },
  {
    id: 'q5',
    topic: 'dp',
    question: 'Dynamic programming is best applied to problems that have which property?',
    options: { A: 'Greedy substructure', B: 'Overlapping subproblems', C: 'Random subproblems', D: 'Non-recursive structure' },
    correctOption: 'B'
  }
];

export async function GET() {
  const sanitized = QUIZ_QUESTIONS.map(({ id, topic, question, options }) => ({
    id, topic, question, options
  }));
  return NextResponse.json({
    questions: sanitized,
    totalQuestions: 5
  });
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, explanationMode, answers } = await req.json();

    if (!sessionId || !explanationMode || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, explanationMode, answers[]' }, { status: 400 });
    }

    const validModes = ['simple', 'complex'];
    if (!validModes.includes(explanationMode)) {
      return NextResponse.json({ error: 'Invalid explanationMode' }, { status: 400 });
    }

    if (answers.length < 1 || answers.length > 10) {
      return NextResponse.json({ error: 'answers must be 1-10 items' }, { status: 400 });
    }

    const results: Array<{ questionId: string; topic: string; correct: boolean; correctOption: string; initialConfidence: number; explanation: string }> = [];
    const topicScores: Record<string, { total: number; correct: number }> = {};
    let overallScore = 0;

    for (const answer of answers) {
      const { questionId, topic, selectedOption, timeTaken } = answer;
      if (!questionId || !topic || !selectedOption || timeTaken === undefined) {
        continue;
      }

      const question = QUIZ_QUESTIONS.find(q => q.id === questionId);
      if (!question) continue;

      const correct = selectedOption === question.correctOption;
      if (correct) overallScore++;

      const speedBonus = timeTaken < 20 ? 0.1 : 0;
      const initialConfidence = correct ? (0.6 + speedBonus) : 0.3;

      if (!topicScores[topic]) topicScores[topic] = { total: 0, correct: 0 };
      topicScores[topic].total++;
      if (correct) topicScores[topic].correct++;

      results.push({
        questionId,
        topic,
        correct,
        correctOption: question.correctOption,
        initialConfidence,
        explanation: correct
          ? `Great job! ${getBriefExplanation(topic, question.correctOption)}`
          : `The correct answer is ${question.correctOption}. ${getBriefExplanation(topic, question.correctOption)}`
      });
    }

    const prompt = `
      ${getModePersona(explanationMode)}
      A student just completed a DSA onboarding quiz.
      Results: ${JSON.stringify(results.map(r => ({ topic: r.topic, correct: r.correct })))}
      Write 2 encouraging sentences summarizing their starting strengths and what to focus on.
      Keep it warm and motivating. Do not list the questions or options.
      Respond in JSON: { "feedback": string }
    `;

    const { result: aiRaw } = await withFallback(
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
      JSON.stringify({ feedback: 'Good effort! Keep practicing.' })
    );

    let aiFeedback = 'Good effort! Keep practicing.';
    try {
      const parsed = JSON.parse(aiRaw);
      aiFeedback = parsed.feedback || aiFeedback;
    } catch {}

    const confidenceProfile: Record<string, number> = {
      arrays: 0.5, trees: 0.5, graphs: 0.5, dp: 0.5,
      recursion: 0.5, sorting: 0.5, searching: 0.5, strings: 0.5, heaps: 0.5, linked_lists: 0.5
    };

    for (const [topic, scores] of Object.entries(topicScores)) {
      if (scores.total >= 1 && confidenceProfile[topic] !== undefined) {
        confidenceProfile[topic] = scores.correct > 0 ? 0.7 : 0.3;
      }
    }

    await supabaseServer.from('learner_profiles').upsert({
      session_id: sessionId,
      explanation_mode: explanationMode,
      arrays_confidence: confidenceProfile.arrays,
      trees_confidence: confidenceProfile.trees,
      graphs_confidence: confidenceProfile.graphs,
      dp_confidence: confidenceProfile.dp,
      recursion_confidence: confidenceProfile.recursion,
      sorting_confidence: confidenceProfile.sorting,
      searching_confidence: confidenceProfile.searching,
      strings_confidence: confidenceProfile.strings,
      heaps_confidence: confidenceProfile.heaps,
      linked_lists_confidence: confidenceProfile.linked_lists,
    }, { onConflict: 'session_id' });

    for (const result of results) {
      await supabaseServer.from('problem_attempts').insert({
        session_id: sessionId,
        topic: result.topic,
        final_status: 'quiz',
        mistake_pattern: result.correct ? null : `quiz_wrong:${result.questionId}`,
      });
    }

    return NextResponse.json({
      results,
      overallScore,
      totalQuestions: 5,
      aiFeedback,
      confidenceProfile,
    });

  } catch (error: unknown) {
    console.error('[/api/quiz POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getBriefExplanation(topic: string, correctOption: string): string {
  const explanations: Record<string, string> = {
    'arrays-B': 'Arrays support O(1) index access because memory is contiguous.',
    'trees-A': 'The smallest element in a BST is always the leftmost node.',
    'recursion-C': 'A base case stops the recursion from running forever.',
    'graphs-B': 'BFS explores all nodes at distance d before distance d+1.',
    'dp-B': 'DP optimizes by storing solutions to overlapping subproblems.',
  };
  return explanations[`${topic}-${correctOption}`] || 'Keep learning!';
}