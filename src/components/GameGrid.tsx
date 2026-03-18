"use client";

import React from "react";
import type { Direction, Position, MatchStatus } from "@/lib/types";

interface GameGridProps {
  grid: boolean[][];
  removed: boolean[][];
  pos: Position | null;
  onCellClick: (x: number, y: number) => void;
  onMove: (direction: Direction) => void;
  isMyTurn: boolean;
  status: MatchStatus;
}

export default function GameGrid({ 
  grid, 
  removed, 
  pos, 
  onCellClick, 
  onMove, 
  isMyTurn, 
  status 
}: GameGridProps) {
  
  const getValidMoveTargets = (): Position[] => {
    if (!pos) return [];
    const targets: Position[] = [];
    const dirs = [
      { dx: -1, dy: 0, name: "up" },
      { dx: 1, dy: 0, name: "down" },
      { dx: 0, dy: -1, name: "left" },
      { dx: 0, dy: 1, name: "right" },
    ];

    for (const { dx, dy } of dirs) {
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (
        nx >= 0 &&
        nx < grid.length &&
        ny >= 0 &&
        ny < grid[0].length &&
        grid[nx][ny] &&
        !removed[nx][ny]
      ) {
        targets.push({ x: nx, y: ny });
      }
    }
    return targets;
  };

  const validTargets = status === "playing" && isMyTurn ? getValidMoveTargets() : [];

  const handleCellClick = (x: number, y: number) => {
    if (status === "placing") {
      onCellClick(x, y);
      return;
    }

    if (status === "playing" && isMyTurn && pos) {
      const target = validTargets.find(t => t.x === x && t.y === y);
      if (target) {
        if (x === pos.x - 1) onMove("up");
        else if (x === pos.x + 1) onMove("down");
        else if (y === pos.y - 1) onMove("left");
        else if (y === pos.y + 1) onMove("right");
      }
    }
  };

  // Calculate cell size based on grid dimensions
  const maxDim = Math.max(grid.length, grid[0].length);
  const cellSize = maxDim <= 8 ? "w-14 h-14" : maxDim <= 12 ? "w-10 h-10" : maxDim <= 20 ? "w-8 h-8" : "w-6 h-6";
  const fontSize = maxDim <= 8 ? "text-xl" : maxDim <= 12 ? "text-base" : "text-xs";

  return (
    <div
      className="inline-grid gap-1.5 p-4 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 shadow-2xl"
      style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
    >
      {grid.map((row, i) =>
        row.map((available, j) => {
          const isCurrentPos = pos?.x === i && pos?.y === j;
          const isDestroyed = removed[i][j];
          const isRemovedByFormula = !available;
          const isValidTarget = validTargets.some((t) => t.x === i && t.y === j);
          
          let cellClass = `${cellSize} rounded-xl flex items-center justify-center transition-all duration-300 ${fontSize} select-none relative group `;

          if (isCurrentPos) {
            cellClass += "bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-110 z-10 ring-2 ring-cyan-300 ";
          } else if (isDestroyed) {
            cellClass += "bg-slate-950/80 border border-slate-900 scale-90 opacity-40 ";
          } else if (isRemovedByFormula) {
            cellClass += "bg-slate-950/20 border border-slate-900/50 opacity-20 ";
          } else if (isValidTarget) {
            cellClass += "bg-cyan-500/10 border-2 border-cyan-500/40 cursor-pointer hover:bg-cyan-500/30 hover:scale-105 animate-pulse ";
          } else {
            cellClass += "bg-slate-800/40 border border-slate-700/30 hover:bg-slate-700/50 ";
          }

          return (
            <div
              key={`${i}-${j}`}
              className={cellClass}
              onClick={() => handleCellClick(i, j)}
            >
              {isCurrentPos ? (
                <div className="w-full h-full flex items-center justify-center animate-bounce">
                  <div className="w-3/5 h-3/5 bg-white rounded-full shadow-lg" />
                </div>
              ) : isRemovedByFormula ? (
                <div className="w-1 h-1 bg-slate-700 rounded-full" />
              ) : isDestroyed ? (
                <div className="text-red-500/50 text-xs">✕</div>
              ) : isValidTarget ? (
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              ) : null}
              
              {/* Hover effect for empty cells */}
              {!isCurrentPos && !isDestroyed && !isRemovedByFormula && !isValidTarget && (
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
