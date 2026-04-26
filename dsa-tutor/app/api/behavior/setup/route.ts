import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { createTables } = await req.json();

    if (createTables) {
      // Create behavior_signals table
      await supabaseServer.rpc('create_behavior_signals_table', {});
    }

    return NextResponse.json({ message: 'Tables created or already exist' });
  } catch (error: unknown) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed - run SQL manually' }, { status: 500 });
  }
}