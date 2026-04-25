// app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function GET(req: NextRequest) {
  try {
    const roomCode = req.nextUrl.searchParams.get('roomCode');
    if (!roomCode) {
      return NextResponse.json({ error: 'roomCode required' }, { status: 400 });
    }

    const { data: room } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });

  } catch (error: any) {
    console.error('[/api/rooms GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mode, sessionId } = await req.json();

    if (!mode || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields: mode, sessionId' }, { status: 400 });
    }

    const roomCode = generateRoomCode();

    const { data: room, error } = await supabaseServer
      .from('rooms')
      .insert({
        room_code: roomCode,
        mode,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    await supabaseServer.from('room_members').insert({
      room_id: room.id,
      session_id: sessionId,
      role: 'host',
      status: 'active',
    });

    return NextResponse.json({ room: { ...room, room_code: roomCode } });

  } catch (error: any) {
    console.error('[/api/rooms POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}