// ============================================
// Grid Battle 1v1 – Game Logic (Pure Functions)
// ============================================

import { Direction, Position } from "./types";

/**
 * Generate the initial grid based on the formula:
 * Cell (i,j) is removed if (p^i + q^j) % s === 0
 * i and j are 1-indexed in the formula (1..N, 1..M).
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

  // Precompute powers for efficiency (1-indexed)
  const powP: bigint[] = [1n]; // powP[0] = 1 (unused for cell)
  for (let i = 1; i <= N; i++) powP.push(powP[i - 1] * bigP);

  const powQ: bigint[] = [1n];
  for (let j = 1; j <= M; j++) powQ.push(powQ[j - 1] * bigQ);

  for (let i = 0; i < N; i++) {
    const row: boolean[] = [];
    for (let j = 0; j < M; j++) {
      // Use 1-based indices for the formula (p^1 + q^1 for top-left)
      const val = powP[i + 1] + powQ[j + 1];
      row.push(val % bigS !== 0n);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Get the target position from a starting point and direction.
 */
export function getTargetPosition(pos: Position, direction: Direction): Position {
  switch (direction) {
    case "up": return { x: pos.x - 1, y: pos.y };
    case "down": return { x: pos.x + 1, y: pos.y };
    case "left": return { x: pos.x, y: pos.y - 1 };
    case "right": return { x: pos.x, y: pos.y + 1 };
  }
}

/**
 * Check if a player can move from their current position.
 */
export function canMove(
  pos: Position,
  grid: boolean[][],
  removed: boolean[][]
): boolean {
  const N = grid.length;
  const M = grid[0].length;
  const dirs = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];

  for (const { dx, dy } of dirs) {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (
      nx >= 0 && nx < N && 
      ny >= 0 && ny < M && 
      grid[nx][ny] && 
      !removed[nx][ny]
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Validates if the initial pawn placement is on an available cell.
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
