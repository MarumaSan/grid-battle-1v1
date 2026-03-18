"use client";

import React from "react";
import type { Match, Direction, Position, PlayerRole } from "@/lib/types";

interface GameGridProps {
  match: Match;
  role: PlayerRole;
  onPlacePawn: (pos: Position) => void;
  onMove: (direction: Direction) => void;
}

const directionMap: Record<string, Direction> = {
  up: "up",
  down: "down",
  left: "left",
  right: "right",
};

function getValidMoveTargets(match: Match): Position[] {
  if (!match.pos) return [];
  const targets: Position[] = [];
  const dirs = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];

  for (const { dx, dy } of dirs) {
    const nx = match.pos.x + dx;
    const ny = match.pos.y + dy;
    if (
      nx >= 0 &&
      nx < match.grid.length &&
      ny >= 0 &&
      ny < match.grid[0].length &&
      match.grid[nx][ny] &&
      !match.removed[nx][ny]
    ) {
      targets.push({ x: nx, y: ny });
    }
  }
  return targets;
}

function getDirectionFromPositions(from: Position, to: Position): Direction | null {
  if (to.x === from.x - 1 && to.y === from.y) return "up";
  if (to.x === from.x + 1 && to.y === from.y) return "down";
  if (to.x === from.x && to.y === from.y - 1) return "left";
  if (to.x === from.x && to.y === from.y + 1) return "right";
  return null;
}

export default function GameGrid({ match, role, onPlacePawn, onMove }: GameGridProps) {
  const isMyTurn = match.currentPlayer === role;
  const validTargets = match.status === "playing" && isMyTurn ? getValidMoveTargets(match) : [];

  const handleCellClick = (x: number, y: number) => {
    if (match.status === "placing" && role === "Alice") {
      if (match.grid[x][y]) {
        onPlacePawn({ x, y });
      }
      return;
    }

    if (match.status === "playing" && isMyTurn && match.pos) {
      const direction = getDirectionFromPositions(match.pos, { x, y });
      if (direction && validTargets.some((t) => t.x === x && t.y === y)) {
        onMove(direction);
      }
    }
  };

  // Calculate cell size based on grid dimensions
  const maxDim = Math.max(match.grid.length, match.grid[0].length);
  const cellSize = maxDim <= 8 ? "w-14 h-14" : maxDim <= 12 ? "w-10 h-10" : maxDim <= 20 ? "w-8 h-8" : "w-6 h-6";
  const fontSize = maxDim <= 8 ? "text-xl" : maxDim <= 12 ? "text-base" : "text-xs";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Turn indicator */}
      <div className="flex items-center gap-3 text-sm">
        {match.status === "placing" ? (
          <div className={`px-4 py-2 rounded-full font-medium ${
            role === "Alice" 
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse" 
              : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
          }`}>
            {role === "Alice" ? "👆 Click to place your pawn" : "⏳ Alice is placing the pawn..."}
          </div>
        ) : match.status === "playing" ? (
          <div className={`px-4 py-2 rounded-full font-medium ${
            isMyTurn 
              ? "bg-green-500/20 text-green-300 border border-green-500/40 animate-pulse" 
              : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
          }`}>
            {isMyTurn ? "🎯 Your turn! Click a highlighted cell" : `⏳ Waiting for ${match.currentPlayer}...`}
          </div>
        ) : null}
      </div>

      {/* Grid */}
      <div
        className="inline-grid gap-1 p-3 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10"
        style={{ gridTemplateColumns: `repeat(${match.grid[0].length}, minmax(0, 1fr))` }}
      >
        {match.grid.map((row, i) =>
          row.map((available, j) => {
            const isCurrentPos = match.pos?.x === i && match.pos?.y === j;
            const isDestroyed = match.removed[i][j];
            const isRemovedByFormula = !available;
            const isValidTarget = validTargets.some((t) => t.x === i && t.y === j);
            const isPlaceable = match.status === "placing" && role === "Alice" && available;

            let cellClass = `${cellSize} rounded-lg flex items-center justify-center transition-all duration-300 ${fontSize} select-none `;

            if (isCurrentPos) {
              cellClass += "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50 scale-110 z-10 ring-2 ring-cyan-300 ";
            } else if (isDestroyed) {
              cellClass += "bg-red-900/30 border border-red-800/30 scale-90 opacity-50 ";
            } else if (isRemovedByFormula) {
              cellClass += "bg-gray-900/60 border border-gray-800/20 ";
            } else if (isValidTarget) {
              cellClass += "bg-green-500/30 border-2 border-green-400/60 cursor-pointer hover:bg-green-500/50 hover:scale-105 animate-pulse ";
            } else if (isPlaceable) {
              cellClass += "bg-slate-700/50 border border-slate-600/40 cursor-pointer hover:bg-cyan-500/30 hover:border-cyan-400/50 hover:scale-105 ";
            } else {
              cellClass += "bg-slate-800/60 border border-slate-700/30 ";
            }

            return (
              <div
                key={`${i}-${j}`}
                className={cellClass}
                onClick={() => handleCellClick(i, j)}
              >
                {isCurrentPos ? (
                  <span className="animate-bounce">♟️</span>
                ) : isRemovedByFormula ? (
                  <span className="opacity-30">✖</span>
                ) : isDestroyed ? (
                  <span className="opacity-40">💥</span>
                ) : isValidTarget ? (
                  <span className="opacity-80">◉</span>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Match info */}
      <div className="flex items-center gap-6 text-xs text-gray-400 mt-2">
        <span>s = {match.s}</span>
        <span>Moves: {match.moveCount}</span>
        <span>Grid: {match.grid.length}×{match.grid[0].length}</span>
      </div>
    </div>
  );
}
