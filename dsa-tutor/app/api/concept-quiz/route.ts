import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatJSON } from '@/lib/agent/ollama';
import { groq, GROQ_STRONG } from '@/lib/agent/groq';
import { geminiChat } from '@/lib/agent/gemini';
import { withFallback } from '@/lib/agent/withFallback';
import { getModePersona } from '@/lib/agent/prompts';
import { supabaseServer } from '@/lib/supabase/server';

interface Answer {
  questionId: string;
  selectedOption: string;
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, videoId, topic, explanationMode, answers } = await req.json();

    if (!sessionId || !videoId || !topic || !answers) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, videoId, topic, answers' }, { status: 400 });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: 'answers must be a non-empty array' }, { status: 400 });
    }
    for (const answer of answers) {
      if (!answer.questionId || !answer.selectedOption) {
        return NextResponse.json({ error: 'Each answer must have questionId and selectedOption' }, { status: 400 });
      }
      if (!['A', 'B', 'C', 'D'].includes(answer.selectedOption)) {
        return NextResponse.json({ error: 'selectedOption must be A, B, C, or D' }, { status: 400 });
      }
    }

    const { data: questions } = await supabaseServer
      .from('concept_questions')
      .select('*')
      .eq('video_id', videoId)
      .order('order_index');

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this video' }, { status: 404 });
    }

    const results = [];
    let correctCount = 0;

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) {
        continue;
      }

      const isCorrect = answer.selectedOption === question.correct_answer;
      if (isCorrect) {
        correctCount++;
      }

      let aiFeedback = null;
      if (!isCorrect) {
        const persona = getModePersona(explanationMode || 'simple');
        const feedbackPrompt = `
          ${persona}
          A student answered a concept question about ${topic} incorrectly.
          Question: ${question.question_text}
          Their answer: ${answer.selectedOption} — ${question.options[answer.selectedOption]}
          Correct answer: ${question.correct_answer} — ${question.options[question.correct_answer]}
          Standard explanation: ${question.explanation}

          Write a warm, encouraging 2-sentence explanation of why ${question.correct_answer} is right
          and why their choice ${answer.selectedOption} was incorrect. Use an analogy if possible.
          Respond ONLY in JSON: { "feedback": "..." }
        `;

        try {
          const { result: feedbackRaw } = await withFallback(
            () => ollamaChatJSON(persona, feedbackPrompt),
            async () => {
              const completion = await groq.chat.completions.create({
                model: GROQ_STRONG,
                messages: [{ role: 'user', content: feedbackPrompt }],
                response_format: { type: 'json_object' },
              });
              return completion.choices[0].message.content!;
            },
            () => geminiChat(feedbackPrompt),
            JSON.stringify({ feedback: question.explanation })
          );

          const feedbackParsed = JSON.parse(feedbackRaw);
          aiFeedback = feedbackParsed.feedback;
        } catch (e) {
          aiFeedback = question.explanation;
        }
      }

      results.push({
        questionId: question.id,
        correct: isCorrect,
        selectedOption: answer.selectedOption,
        correctOption: question.correct_answer,
        aiFeedback
      });

      await supabaseServer.from('learning_progress').insert({
        session_id: sessionId,
        topic,
        stage: 'concept_quiz',
        content_id: question.id,
        status: isCorrect ? 'completed' : 'failed',
        score: isCorrect ? 1.0 : 0.0,
        time_spent_sec: 0
      });
    }

    const overallScore = correctCount / questions.length;
    const passed = overallScore >= 0.6;
    const passingThreshold = 0.6;

    const { data: profile } = await supabaseServer
      .from('learning_profiles')
      .select('concept_scores, struggle_areas, strength_areas')
      .eq('session_id', sessionId)
      .single();

    const conceptScores = profile?.concept_scores || {};
    conceptScores[topic] = overallScore;

    const struggleAreas = profile?.struggle_areas || [];
    const strengthAreas = profile?.strength_areas || [];

    if (overallScore < 0.6 && !struggleAreas.includes(topic)) {
      struggleAreas.push(topic);
    }
    if (overallScore >= 0.85 && !strengthAreas.includes(topic)) {
      strengthAreas.push(topic);
    }

    await supabaseServer
      .from('learning_profiles')
      .upsert({
        session_id: sessionId,
        concept_scores: conceptScores,
        struggle_areas: struggleAreas,
        strength_areas: strengthAreas,
        last_updated: new Date().toISOString()
      }, { onConflict: 'session_id' });

    let nextStep = '';
    if (passed) {
      nextStep = 'Move to coding exercise for ' + topic + '!';
    } else {
      nextStep = 'Watch the video again and try the quiz once more.';
    }

    return NextResponse.json({
      results,
      overallScore,
      totalQuestions: questions.length,
      correctCount,
      passed,
      passingThreshold,
      nextStep
    });

  } catch (error: unknown) {
    console.error('[/api/concept-quiz] Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}