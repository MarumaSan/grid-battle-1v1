// ============================================
// Grid Battle 1v1 – Shared Types (Supabase)
// ============================================

export type PlayerRole = "Alice" | "Bob" | "Observer";

export type Direction = "up" | "down" | "left" | "right";

export type Position = { x: number; y: number };

export type MatchStatus = "waiting_for_opponent" | "placing" | "playing" | "finished";

export type RoomStatus = "waiting" | "active" | "closed";

export interface RoomConfig {
  N: number;
  M: number;
  p: number;
  q: number;
  sList: number[];
}

export interface MatchState {
  grid: boolean[][];
  removed: boolean[][];
  pos: Position | null;
}

export interface Match {
  id: string; // uuid
  room_id: string;
  alice_id: string | null;
  bob_id: string | null;
  current_player: PlayerRole;
  state: MatchState;
  s_value: number;
  status: MatchStatus;
  winner: PlayerRole | null;
  move_count: number;
  created_at?: string;
}

export interface Room {
  id: string;
  room_code: string;
  config: RoomConfig;
  status: RoomStatus;
  created_at?: string;
}
