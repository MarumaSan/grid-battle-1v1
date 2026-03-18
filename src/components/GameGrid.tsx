"use client";

import React, { memo, useMemo, useCallback } from "react";
import type { Direction, Position, MatchStatus } from "@/lib/types";

// 1. Optimized Cell Component - Memoized to prevent re-renders
// unless its specific props change.
interface CellProps {
  x: number;
  y: number;
  available: boolean;
  isDestroyed: boolean;
  isCurrentPos: boolean;
  isValidTarget: boolean;
  cellSize: string;
  fontSize: string;
  onClick: (x: number, y: number) => void;
}

const Cell = memo(({
  x,
  y,
  available,
  isDestroyed,
  isCurrentPos,
  isValidTarget,
  cellSize,
  fontSize,
  onClick,
}: CellProps) => {
  const isRemovedByFormula = !available;
  
  // Minimal conditional logic inside render
  const cellClass = useMemo(() => {
    const base = `${cellSize} rounded-2xl flex items-center justify-center transition-all duration-300 ${fontSize} select-none relative group `;

    if (isCurrentPos) {
      return base + "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_20px_rgba(99,102,241,0.4)] scale-110 z-10 ring-4 ring-white ";
    }
    if (isDestroyed) {
      return base + "bg-slate-50 border border-slate-100 scale-90 opacity-40 ";
    }
    if (isRemovedByFormula) {
      return base + "bg-slate-100/30 border border-slate-50 opacity-20 ";
    }
    if (isValidTarget) {
      return base + "bg-cyan-50 border-2 border-cyan-400 cursor-pointer hover:bg-cyan-100 animate-pulse ";
    }
    return base + "bg-white border border-slate-200/60 hover:border-indigo-200 hover:bg-slate-50/50 ";
  }, [isCurrentPos, isDestroyed, isRemovedByFormula, isValidTarget, cellSize, fontSize]);

  return (
    <div className={cellClass} onClick={() => onClick(x, y)}>
      {isCurrentPos ? (
        <div className="w-full h-full flex items-center justify-center animate-bounce">
          <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
        </div>
      ) : isRemovedByFormula ? (
        <div className="text-slate-300 font-bold opacity-30 text-[10px]">#</div>
      ) : isDestroyed ? (
        <div className="text-rose-400 text-xs font-black">✕</div>
      ) : isValidTarget ? (
        <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
      ) : null}
    </div>
  );
}, (prev, next) => {
  // Strict comparison to avoid any unnecessary re-renders
  return (
    prev.isDestroyed === next.isDestroyed &&
    prev.isCurrentPos === next.isCurrentPos &&
    prev.isValidTarget === next.isValidTarget &&
    prev.available === next.available &&
    prev.cellSize === next.cellSize &&
    prev.fontSize === next.fontSize
  );
});

Cell.displayName = "Cell";

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
  
  // 2. Stable Move Targets - Only recompute when position or surroundings change
  const validTargets = useMemo((): Position[] => {
    if (!pos || status !== "playing" || !isMyTurn) return [];
    
    const targets: Position[] = [];
    const dirs = [{dx:-1,dy:0},{dx:1,dy:0},{dx:0,dy:-1},{dx:0,dy:1}];

    for (const { dx, dy } of dirs) {
      const nx = pos.x + dx;
      const ny = pos.y + dy;
      if (
        nx >= 0 && nx < grid.length &&
        ny >= 0 && ny < grid[0].length &&
        grid[nx][ny] && !removed[nx][ny]
      ) {
        targets.push({ x: nx, y: ny });
      }
    }
    return targets;
  }, [pos, grid, removed, status, isMyTurn]);

  // 3. Stable Callback - Prevent Cell re-renders due to function identity
  const handleCellClick = useCallback((x: number, y: number) => {
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
  }, [status, isMyTurn, pos, validTargets, onCellClick, onMove]);

  const maxDim = Math.max(grid.length, grid[0].length);
  const { cellSize, fontSize } = useMemo(() => ({
    cellSize: maxDim <= 8 ? "w-16 h-16" : maxDim <= 12 ? "w-12 h-12" : maxDim <= 20 ? "w-9 h-9" : "w-7 h-7",
    fontSize: maxDim <= 8 ? "text-xl" : maxDim <= 12 ? "text-base" : "text-xs"
  }), [maxDim]);

  // 4. Grid Rendering - Optimized with key stability
  return (
    <div
      className="inline-grid gap-2 p-6 rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(99,102,241,0.1)] border border-slate-100"
      style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
    >
      {grid.map((row, i) =>
        row.map((available, j) => (
          <Cell
            key={`${i}-${j}`}
            x={i}
            y={j}
            available={available}
            isDestroyed={removed[i][j]}
            isCurrentPos={pos?.x === i && pos?.y === j}
            isValidTarget={validTargets.some(t => t.x === i && t.y === j)}
            cellSize={cellSize}
            fontSize={fontSize}
            onClick={handleCellClick}
          />
        ))
      )}
    </div>
  );
}
