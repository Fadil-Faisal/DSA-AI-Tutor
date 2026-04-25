// app/api/rooms/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { roomCode, sessionId } = await req.json();

    if (!roomCode || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields: roomCode, sessionId' }, { status: 400 });
    }

    const { data: room } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status === 'active') {
      return NextResponse.json({ error: 'Room already in progress' }, { status: 400 });
    }

    const { data: existingMember } = await supabaseServer
      .from('room_members')
      .select('*')
      .eq('room_id', room.id)
      .eq('session_id', sessionId)
      .single();

    if (!existingMember) {
      await supabaseServer.from('room_members').insert({
        room_id: room.id,
        session_id: sessionId,
        role: 'participant',
        status: 'active',
      });
    }

    const { data: members } = await supabaseServer
      .from('room_members')
      .select('session_id, role, status')
      .eq('room_id', room.id);

    return NextResponse.json({
      room,
      members,
    });

  } catch (error: unknown) {
    console.error('[/api/rooms/join POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}