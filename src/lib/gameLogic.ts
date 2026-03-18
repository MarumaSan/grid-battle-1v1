// ============================================
// Grid Battle 1v1 – Game Logic (Pure Functions)
// ============================================

import { Match, Direction, Position, PlayerRole } from "./types";

/**
 * Generate the initial grid based on the formula:
 * Cell (i,j) is removed if (p^i + q^j) % s === 0
 * Indexing starts from 1.
 * Uses BigInt for accuracy with large primes.
 */
export function generateGrid(
  N: number,
  M: number,
  p: number,
  q: number,
  s: number
): boolean[][] {
  const grid: boolean[][] = [];
  const bigP = BigInt(p);
  const bigQ = BigInt(q);
  const bigS = BigInt(s);

  // Precompute p^i for i=1..N
  const powP: bigint[] = [0n]; // 1-indexed, powP[0] unused
  let pp = 1n;
  for (let i = 1; i <= N; i++) {
    pp = pp * bigP;
    powP.push(pp);
  }

  // Precompute q^j for j=1..M
  const powQ: bigint[] = [0n];
  let qq = 1n;
  for (let j = 1; j <= M; j++) {
    qq = qq * bigQ;
    powQ.push(qq);
  }

  for (let i = 0; i < N; i++) {
    const row: boolean[] = [];
    for (let j = 0; j < M; j++) {
      // i,j are 0-indexed in array but 1-indexed in formula
      const val = powP[i + 1] + powQ[j + 1];
      const isRemoved = val % bigS === 0n;
      row.push(!isRemoved); // true = available
    }
    grid.push(row);
  }

  return grid;
}

/**
 * Get valid move directions from the current position.
 */
export function getValidMoves(
  grid: boolean[][],
  removed: boolean[][],
  pos: Position
): Direction[] {
  const directions: Direction[] = [];
  const N = grid.length;
  const M = grid[0].length;

  const moves: { dir: Direction; dx: number; dy: number }[] = [
    { dir: "up", dx: -1, dy: 0 },
    { dir: "down", dx: 1, dy: 0 },
    { dir: "left", dx: 0, dy: -1 },
    { dir: "right", dx: 0, dy: 1 },
  ];

  for (const { dir, dx, dy } of moves) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx >= 0 && nx < N && ny >= 0 && ny < M && grid[nx][ny] && !removed[nx][ny]) {
      directions.push(dir);
    }
  }

  return directions;
}

/**
 * Get the target position for a move direction.
 */
export function getTargetPosition(pos: Position, direction: Direction): Position {
  switch (direction) {
    case "up":
      return { x: pos.x - 1, y: pos.y };
    case "down":
      return { x: pos.x + 1, y: pos.y };
    case "left":
      return { x: pos.x, y: pos.y - 1 };
    case "right":
      return { x: pos.x, y: pos.y + 1 };
  }
}

/**
 * Apply a move to the match state. Returns a new Match object.
 */
export function applyMove(match: Match, direction: Direction): Match {
  if (!match.pos) throw new Error("No pawn placed yet");

  const target = getTargetPosition(match.pos, direction);
  const N = match.grid.length;
  const M = match.grid[0].length;

  // Validate move
  if (
    target.x < 0 ||
    target.x >= N ||
    target.y < 0 ||
    target.y >= M ||
    !match.grid[target.x][target.y] ||
    match.removed[target.x][target.y]
  ) {
    throw new Error("Invalid move");
  }

  // Clone removed array
  const newRemoved = match.removed.map((row) => [...row]);
  // Mark old position as destroyed
  newRemoved[match.pos.x][match.pos.y] = true;

  const nextPlayer: PlayerRole = match.currentPlayer === "Alice" ? "Bob" : "Alice";

  const newMatch: Match = {
    ...match,
    pos: target,
    removed: newRemoved,
    currentPlayer: nextPlayer,
    moveCount: match.moveCount + 1,
  };

  // Check if next player can move
  const validMoves = getValidMoves(newMatch.grid, newMatch.removed, target);
  if (validMoves.length === 0) {
    // Next player can't move → current player wins
    newMatch.status = "finished";
    newMatch.winner = match.currentPlayer;
  }

  return newMatch;
}

/**
 * Check if a cell is valid for initial pawn placement.
 */
export function isValidPlacement(
  grid: boolean[][],
  pos: Position
): boolean {
  if (pos.x < 0 || pos.x >= grid.length || pos.y < 0 || pos.y >= grid[0].length) {
    return false;
  }
  return grid[pos.x][pos.y];
}
