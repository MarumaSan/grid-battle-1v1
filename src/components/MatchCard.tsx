"use client";

import React from "react";
import type { Match } from "@/lib/types";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const statusColor =
    match.status === "playing"
      ? "text-green-400"
      : match.status === "finished"
      ? "text-yellow-400"
      : match.status === "placing"
      ? "text-cyan-400"
      : "text-gray-400";

  const statusBg =
    match.status === "playing"
      ? "bg-green-500/10 border-green-500/20"
      : match.status === "finished"
      ? "bg-yellow-500/10 border-yellow-500/20"
      : match.status === "placing"
      ? "bg-cyan-500/10 border-cyan-500/20"
      : "bg-gray-500/10 border-gray-500/20";

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm ${statusBg}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-mono text-xs bg-white/10 px-2 py-1 rounded">
          {match.matchId.slice(0, 6)}
        </span>
        <span className={`text-xs font-semibold uppercase ${statusColor}`}>
          {match.status}
        </span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <span className="text-gray-300 text-sm">Alice</span>
        </div>
        <span className="text-gray-500 text-xs">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm">Bob</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
            B
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>s={match.s}</span>
        <span>Moves: {match.moveCount}</span>
        {match.winner && (
          <span className="text-yellow-400 font-bold">
            🏆 {match.winner} wins!
          </span>
        )}
      </div>

      {/* Mini grid preview */}
      {match.grid.length <= 10 && (
        <div className="mt-3 flex justify-center">
          <div
            className="inline-grid gap-px"
            style={{ gridTemplateColumns: `repeat(${match.grid[0].length}, minmax(0, 1fr))` }}
          >
            {match.grid.map((row, i) =>
              row.map((available, j) => {
                const isPos = match.pos?.x === i && match.pos?.y === j;
                const isDestroyed = match.removed[i][j];
                let bg = "bg-slate-700/50";
                if (!available) bg = "bg-gray-900/60";
                if (isDestroyed) bg = "bg-red-900/40";
                if (isPos) bg = "bg-cyan-400";

                return (
                  <div
                    key={`${i}-${j}`}
                    className={`w-2 h-2 rounded-sm ${bg}`}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
