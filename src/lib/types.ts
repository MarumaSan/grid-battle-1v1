// ============================================
// Grid Battle 1v1 – Shared Types
// ============================================

export type PlayerRole = "Alice" | "Bob";

export type Direction = "up" | "down" | "left" | "right";

export type Position = { x: number; y: number };

export type MatchStatus = "waiting" | "placing" | "playing" | "finished";

export type RoomStatus = "waiting" | "active" | "closed";

export interface RoomConfig {
  N: number;
  M: number;
  p: number;
  q: number;
  sList: number[];
}

export interface Match {
  matchId: string;
  players: {
    Alice: string; // socket ID
    Bob: string;   // socket ID
  };
  currentPlayer: PlayerRole;
  grid: boolean[][];       // true = available, false = removed by formula
  removed: boolean[][];    // true = destroyed (stepped on)
  pos: Position | null;    // current pawn position
  s: number;               // the s value used for this match
  status: MatchStatus;
  winner: PlayerRole | null;
  moveCount: number;
}

export interface Room {
  roomId: string;
  hostSocketId: string;
  config: RoomConfig;
  matches: Match[];
  waitingQueue: string[];  // socket IDs waiting for pairing
  status: RoomStatus;
}

// ============================================
// Socket Events
// ============================================

export interface ServerToClientEvents {
  "room-created": (data: { roomId: string }) => void;
  "room-joined": (data: { role: PlayerRole; matchId: string; match: Match }) => void;
  "waiting-for-opponent": () => void;
  "match-started": (data: { matchId: string; match: Match; role: PlayerRole }) => void;
  "match-updated": (data: { match: Match }) => void;
  "game-over": (data: { winner: PlayerRole; match: Match }) => void;
  "room-closed": () => void;
  "error": (data: { message: string }) => void;
  "host-update": (data: { room: Room }) => void;
  "player-count": (data: { count: number }) => void;
}

export interface ClientToServerEvents {
  "create-room": (data: { config: RoomConfig }) => void;
  "join-room": (data: { roomId: string }) => void;
  "place-pawn": (data: { matchId: string; pos: Position }) => void;
  "move": (data: { matchId: string; direction: Direction }) => void;
  "close-room": (data: { roomId: string }) => void;
  "host-join": (data: { roomId: string }) => void;
}
