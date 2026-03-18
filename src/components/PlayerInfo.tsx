"use client";

import React from "react";
import type { PlayerRole } from "@/lib/types";

interface PlayerInfoProps {
  role: PlayerRole | null;
  currentPlayer: PlayerRole;
  moveCount: number;
}

export default function PlayerInfo({ role, currentPlayer, moveCount }: PlayerInfoProps) {
  const isAlice = role === "Alice";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Player identity card */}
      <div className={`relative px-8 py-5 rounded-3xl border backdrop-blur-xl shadow-2xl transition-all duration-500 ${
        role 
          ? (isAlice ? "bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/10" : "bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/10")
          : "bg-slate-900 border-slate-800"
      }`}>
        <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-black/40 ${
            isAlice
              ? "bg-gradient-to-br from-cyan-400 to-indigo-500 text-white"
              : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
          }`}>
            {role ? role.charAt(0) : "?"}
          </div>
          <div>
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-0.5">Your Identity</div>
            <div className={`text-2xl font-black tracking-tight ${isAlice ? "text-cyan-400" : "text-purple-400"}`}>
              {role || "Spectator"}
            </div>
          </div>
        </div>
      </div>

      {/* Turn indicator & Stats */}
      <div className="flex items-center gap-8 bg-slate-900/40 px-6 py-3 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <TurnIndicator name="Alice" isActive={currentPlayer === "Alice"} color="cyan" />
          <div className="h-4 w-[1px] bg-slate-800" />
          <TurnIndicator name="Bob" isActive={currentPlayer === "Bob"} color="purple" />
        </div>
        
        <div className="h-6 w-[1px] bg-slate-800" />
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Current Move</span>
          <span className="text-lg font-black text-white leading-tight">#{moveCount}</span>
        </div>
      </div>
    </div>
  );
}

function TurnIndicator({ name, isActive, color }: { name: string, isActive: boolean, color: "cyan" | "purple" }) {
  const colorClass = color === "cyan" ? "text-cyan-400 bg-cyan-400" : "text-purple-400 bg-purple-400";
  
  return (
    <div className={`flex items-center gap-2 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-30"}`}>
      {isActive && <div className={`w-2 h-2 rounded-full animate-pulse ${colorClass}`} />}
      <span className={`text-sm font-black uppercase tracking-widest ${isActive ? (color === "cyan" ? "text-cyan-400" : "text-purple-400") : "text-slate-500"}`}>
        {name}
      </span>
    </div>
  );
}
