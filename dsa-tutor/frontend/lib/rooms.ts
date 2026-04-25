// frontend/lib/rooms.ts
// Room DB helpers — thin wrappers around the backend API routes
// Used by both multiplayer/page.tsx and multiplayer/[roomCode]/page.tsx

import { supabase } from '@/lib/supabase/browser';

export interface RoomMemberPublic {
  id?: string;
  session_id?: string;
  user_id?: string;
  username: string;
  is_host: boolean;
  submitted?: boolean;
  finish_time_sec?: number | null;
  role?: string;
  status?: string;
  current_code?: string;
}

export interface RoomPublic {
  id: string;
  room_code: string;
  mode: string;
  status: 'waiting' | 'active' | 'finished';
  host_id?: string;
  current_problem_id?: string | null;
  created_at?: string;
  members?: RoomMemberPublic[];
}

/** Create a room and add the current user as host. Returns roomCode. */
export async function createRoom(
  mode: string,
  sessionId: string,
  username: string
): Promise<{ roomCode: string; roomId: string }> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, mode, username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to create room');
  }
  const data = await res.json();
  return { roomCode: data.roomCode, roomId: data.roomId };
}

/** Join an existing room as a guest. Returns full room info. */
export async function joinRoom(
  roomCode: string,
  sessionId: string,
  username: string
): Promise<RoomPublic> {
  const res = await fetch('/api/rooms', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, sessionId, username }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to join room');
  }
  return res.json();
}

/** Fetch room + members by code. */
export async function getRoomByCode(roomCode: string): Promise<RoomPublic> {
  const res = await fetch(`/api/rooms?roomCode=${roomCode}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Room not found');
  }
  const data = await res.json();
  return {
    id: data.roomId,
    room_code: data.roomCode,
    mode: data.mode,
    status: data.status,
    current_problem_id: data.currentProblemId,
    members: data.members ?? [],
  };
}

/** Host starts the battle — updates rooms.status = 'active'. */
export async function startRoom(roomCode: string, sessionId: string): Promise<void> {
  const res = await fetch('/api/rooms/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode, sessionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Failed to start room');
  }
}

/** Push a code update to the room_members table (triggers Realtime). */
export async function pushCodeUpdate(
  roomId: string,
  sessionId: string,
  code: string
): Promise<void> {
  await fetch('/api/rooms', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, sessionId, currentCode: code }),
  });
}

/** Subscribe to room status changes (waiting → active → finished). */
export function subscribeToRoomStatus(
  roomCode: string,
  onStatusChange: (status: string) => void
) {
  const channel = supabase
    .channel(`room-status:${roomCode}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `room_code=eq.${roomCode}`,
      },
      (payload) => {
        const newStatus = (payload.new as { status?: string }).status;
        if (newStatus) onStatusChange(newStatus);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/** Subscribe to room_members changes (new players joining, code updates). */
export function subscribeToRoomMembers(
  roomId: string,
  onMembersChange: (members: RoomMemberPublic[]) => void
) {
  const channel = supabase
    .channel(`room-members:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_members',
        filter: `room_id=eq.${roomId}`,
      },
      async () => {
        // Re-fetch all members on any change
        const { data } = await supabase
          .from('room_members')
          .select('*')
          .eq('room_id', roomId);
        if (data) onMembersChange(data as RoomMemberPublic[]);
      }
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/** Broadcast live code changes via Supabase Realtime channel (low latency). */
export function createCodeBroadcastChannel(roomCode: string, mySessionId: string) {
  const channel = supabase.channel(`code:${roomCode}`);

  const subscribe = (onOpponentCode: (code: string, sessionId: string) => void) => {
    channel
      .on('broadcast', { event: 'code_update' }, ({ payload }) => {
        if (payload.sessionId !== mySessionId) {
          onOpponentCode(payload.code, payload.sessionId);
        }
      })
      .subscribe();
    return channel;
  };

  const broadcast = (code: string) => {
    channel.send({
      type: 'broadcast',
      event: 'code_update',
      payload: { sessionId: mySessionId, code },
    });
  };

  const unsubscribe = () => supabase.removeChannel(channel);

  return { subscribe, broadcast, unsubscribe };
}
