// app/api/problems/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const topic = req.nextUrl.searchParams.get('topic');
    const difficulty = req.nextUrl.searchParams.get('difficulty');
    const limit = req.nextUrl.searchParams.get('limit') || '20';

    let query = supabaseServer
      .from('problems_bank')
      .select('id, title, topic, difficulty, description, time_complexity, space_complexity, companies');

    if (topic) {
      query = query.eq('topic', topic);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: problems, error } = await query
      .limit(parseInt(limit))
      .order('title');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
    }

    return NextResponse.json({ problems });

  } catch (error: any) {
    console.error('[/api/problems GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}