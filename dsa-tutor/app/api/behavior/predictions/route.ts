import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  const { data: predictions, error } = await supabaseServer
    .from('agent_predictions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }

  const { data: signals } = await supabaseServer
    .from('behavior_signals')
    .select('signal_type, value')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(100);

  const signalCounts = signals?.reduce((acc: Record<string, number>, s) => {
    acc[s.signal_type] = (acc[s.signal_type] || 0) + 1;
    return acc;
  }, {}) || {};

  return NextResponse.json({
    predictions: predictions || [],
    signalCounts,
    latestPrediction: predictions?.[0] || null,
  });
}