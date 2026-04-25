// lib/agent/confidence.ts
import { supabaseServer } from '@/lib/supabase/server';

export function calculateConfidenceDelta(
  correct: boolean,
  timeTaken: number,
  attemptsCount: number
): number {
  if (correct) {
    const speedBonus = timeTaken < 120 ? 0.05 : 0;
    const attemptPenalty = attemptsCount > 2 ? -0.02 : 0;
    return Math.min(0.15 + speedBonus + attemptPenalty, 0.20);
  }
  return -0.05;
}

export const clampConfidence = (v: number) => Math.max(0, Math.min(1, v));

export async function updateConfidence(
  sessionId: string,
  topic: string,
  delta: number
): Promise<void> {
  const columnName = `${topic}_confidence`;

  const { data } = await supabaseServer
    .from('learner_profiles')
    .select(columnName)
    .eq('session_id', sessionId)
    .single();

  const currentValue = (data as any)?.[columnName] ?? 0.5;
  const newValue = clampConfidence(currentValue + delta);

  await supabaseServer
    .from('learner_profiles')
    .update({ [columnName]: newValue, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId);
}