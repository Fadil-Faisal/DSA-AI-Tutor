// app/api/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
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

    const { data: members } = await supabaseServer
      .from('room_members')
      .select('session_id, role, current_code, status')
      .eq('room_id', room.id);

    return NextResponse.json({
      roomId: room.id,
      roomCode: room.room_code,
      mode: room.mode,
      status: room.status,
      currentProblemId: room.current_problem_id,
      members: members || [],
    });

  } catch (error: any) {
    console.error('[/api/rooms GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, mode } = await req.json();

    if (!sessionId || !mode) {
      return NextResponse.json({ error: 'Missing required fields: sessionId, mode' }, { status: 400 });
    }

    const validModes = ['collaborative', 'battle', 'mentor'];
    if (!validModes.includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode. Must be collaborative, battle, or mentor.' }, { status: 400 });
    }

    let roomCode = generateRoomCode();
    let retries = 0;
    let room: any;

    while (retries < 5) {
      const existing = await supabaseServer
        .from('rooms')
        .select('id')
        .eq('room_code', roomCode)
        .single();

      if (!existing.data) {
        const { data, error } = await supabaseServer
          .from('rooms')
          .insert({ room_code: roomCode, mode, status: 'waiting', current_problem_id: null })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
        }
        room = data;
        break;
      }
      roomCode = generateRoomCode();
      retries++;
    }

    if (retries >= 5) {
      return NextResponse.json({ error: 'Failed to generate unique room code' }, { status: 500 });
    }

    await supabaseServer.from('room_members').insert({
      room_id: room.id,
      session_id: sessionId,
      role: 'player_one',
      current_code: '',
      status: 'active',
    });

    return NextResponse.json({
      roomCode: room.room_code,
      roomId: room.id,
      mode: room.mode,
      status: room.status,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[/api/rooms POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { roomCode, sessionId } = await req.json();

    if (!roomCode || roomCode.length !== 6) {
      return NextResponse.json({ error: 'roomCode must be 6 characters' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    const { data: room } = await supabaseServer
      .from('rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (!room) {
      return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
    }

    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'Room is already active or finished.' }, { status: 409 });
    }

    const { data: existingMember } = await supabaseServer
      .from('room_members')
      .select('id')
      .eq('room_id', room.id)
      .eq('session_id', sessionId)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'You are already in this room.' }, { status: 409 });
    }

    const role = room.mode === 'mentor' ? 'learner' : 'player_two';

    await supabaseServer.from('room_members').insert({
      room_id: room.id,
      session_id: sessionId,
      role,
      current_code: '',
      status: 'active',
    });

    await supabaseServer
      .from('rooms')
      .update({ status: 'active' })
      .eq('id', room.id);

    return NextResponse.json({
      roomId: room.id,
      roomCode: room.room_code,
      mode: room.mode,
      status: 'active',
      role,
      currentProblemId: room.current_problem_id,
    });

  } catch (error: any) {
    console.error('[/api/rooms PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { roomId, sessionId, currentCode } = await req.json();

    if (!roomId || !sessionId || currentCode === undefined) {
      return NextResponse.json({ error: 'Missing required fields: roomId, sessionId, currentCode' }, { status: 400 });
    }

    const { data: member } = await supabaseServer
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('session_id', sessionId)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Member not found in room.' }, { status: 404 });
    }

    await supabaseServer
      .from('room_members')
      .update({ current_code: currentCode })
      .eq('room_id', roomId)
      .eq('session_id', sessionId);

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[/api/rooms PUT] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}