// app/api/rooms/start/route.ts
// Called by the host to transition room from 'waiting' → 'active'.
// Only the host (player_one) is allowed to do this.

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { roomCode, sessionId } = await req.json();

    if (!roomCode || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: roomCode, sessionId' },
        { status: 400 }
      );
    }

    // Look up the room
    const { data: room, error: roomError } = await supabaseServer
      .from('rooms')
      .select('id, status')
      .eq('room_code', roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: `Room is already ${room.status}` },
        { status: 409 }
      );
    }

    // Verify the caller is in this room (must be player_one / host)
    const { data: member } = await supabaseServer
      .from('room_members')
      .select('role')
      .eq('room_id', room.id)
      .eq('session_id', sessionId)
      .single();

    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this room' },
        { status: 403 }
      );
    }

    // Check enough members to start (need at least 2)
    const { count } = await supabaseServer
      .from('room_members')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if (!count || count < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 players to start' },
        { status: 400 }
      );
    }

    // Update status — this triggers Supabase Realtime → both clients navigate
    const { error: updateError } = await supabaseServer
      .from('rooms')
      .update({ status: 'active' })
      .eq('id', room.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to start room', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: 'active' });
  } catch (error: unknown) {
    console.error('[/api/rooms/start POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
