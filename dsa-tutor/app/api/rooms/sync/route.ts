// app/api/rooms/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { roomId, sessionId, currentCode, cursorPosition, status } = await req.json();

    if (!roomId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields: roomId, sessionId' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (currentCode !== undefined) updateData.current_code = currentCode;
    if (cursorPosition !== undefined) updateData.cursor_position = cursorPosition;
    if (status !== undefined) updateData.status = status;

    await supabaseServer
      .from('room_members')
      .update(updateData)
      .eq('room_id', roomId)
      .eq('session_id', sessionId);

    const { data: members } = await supabaseServer
      .from('room_members')
      .select('session_id, role, current_code, cursor_position, status')
      .eq('room_id', roomId);

    const { data: room } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    return NextResponse.json({
      room,
      members,
    });

  } catch (error: any) {
    console.error('[/api/rooms/sync POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}