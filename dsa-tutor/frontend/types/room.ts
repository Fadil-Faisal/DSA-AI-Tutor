export type RoomMode = 'collaborative' | 'battle' | 'mentor';
export type RoomStatus = 'waiting' | 'active' | 'finished';
export type PlayerRole = 'player_one' | 'player_two' | 'mentor' | 'learner';

export interface Room {
  id: string;
  room_code: string;
  mode: RoomMode;
  status: RoomStatus;
  current_problem_id: string | null;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  session_id: string;
  role: PlayerRole;
  current_code: string;
  cursor_position: { line: number; column: number } | null;
  status: 'active' | 'disconnected' | 'finished';
  created_at: string;
}
