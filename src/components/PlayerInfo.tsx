"use client";

import React from "react";
import type { PlayerRole } from "@/lib/types";

interface PlayerInfoProps {
  role: PlayerRole;
  currentPlayer: PlayerRole;
  moveCount: number;
  status: string;
}

export default function PlayerInfo({ role, currentPlayer, moveCount, status }: PlayerInfoProps) {
  const isAlice = role === "Alice";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Player card */}
      <div className={`relative px-6 py-4 rounded-2xl border backdrop-blur-md ${
        isAlice
          ? "bg-cyan-500/10 border-cyan-500/30"
          : "bg-purple-500/10 border-purple-500/30"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
            isAlice
              ? "bg-gradient-to-br from-cyan-400 to-blue-500"
              : "bg-gradient-to-br from-purple-400 to-pink-500"
          }`}>
            {isAlice ? "A" : "B"}
          </div>
          <div>
            <div className="text-white font-semibold text-lg">
              You are {role}
            </div>
            <div className="text-gray-400 text-sm">
              {isAlice ? "🔵 Cyan Team" : "🟣 Purple Team"}
            </div>
          </div>
        </div>
      </div>

      {/* VS indicator */}
      {status === "playing" && (
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            currentPlayer === "Alice" 
              ? "bg-cyan-500/30 text-cyan-300 ring-2 ring-cyan-400/50" 
              : "bg-gray-700/50 text-gray-400"
          }`}>
            Alice
          </div>
          <span className="text-gray-500 text-xs">VS</span>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            currentPlayer === "Bob" 
              ? "bg-purple-500/30 text-purple-300 ring-2 ring-purple-400/50" 
              : "bg-gray-700/50 text-gray-400"
          }`}>
            Bob
          </div>
        </div>
      )}

      {/* Move counter */}
      <div className="text-xs text-gray-500">
        Move #{moveCount}
      </div>
    </div>
  );
}
