// lib/agent/spaced.ts
import { supabaseServer } from '@/lib/supabase/server';

const ALL_TOPICS = [
  'arrays', 'trees', 'graphs', 'dp', 'recursion',
  'sorting', 'searching', 'strings', 'heaps', 'linked_lists'
];

// Returns topics not practiced in the last 48 hours
export async function getDueTopics(sessionId: string): Promise<string[]> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data } = await supabaseServer
    .from('problem_attempts')
    .select('topic')
    .eq('session_id', sessionId)
    .gt('created_at', cutoff);

  const recentTopics = new Set(data?.map((r: { topic: string }) => r.topic));
  return ALL_TOPICS.filter(t => !recentTopics.has(t));
}

// Returns the most frequent mistake pattern for a session
export async function getTopMistakePattern(sessionId: string): Promise<string | null> {
  const { data } = await supabaseServer
    .from('problem_attempts')
    .select('mistake_pattern')
    .eq('session_id', sessionId)
    .not('mistake_pattern', 'is', null);

  if (!data?.length) return null;

  const counts: Record<string, number> = {};
  data.forEach((r: { mistake_pattern: string | null }) => {
    if (r.mistake_pattern) {
      counts[r.mistake_pattern] = (counts[r.mistake_pattern] ?? 0) + 1;
    }
  });

  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
}