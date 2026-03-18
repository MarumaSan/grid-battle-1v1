// ============================================
// Grid Battle 1v1 – Shared Types (Supabase)
// ============================================

export type PlayerRole = "Alice" | "Bob";

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
  players: {
    Alice: string | null; // socket ID or player identifier
    Bob: string | null;
  };
  currentPlayer: PlayerRole;
  state: MatchState;
  s: number;
  status: MatchStatus;
  winner: PlayerRole | null;
  move_count: number;
}

export interface Room {
  id: string;
  room_code: string;
  config: RoomConfig;
  status: RoomStatus;
}
