"use client";

import { Match } from "@/lib/types";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isWaiting = match.status === "waiting_for_opponent";
  const isFinished = match.status === "finished";

  return (
    <div className={`bg-slate-900/60 p-5 rounded-3xl border transition-all duration-300 ${isFinished ? "border-slate-800" : "border-slate-700/50 hover:border-cyan-500/30"}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Battle Instance</span>
          <span className="text-sm font-mono text-slate-300">ID: {match.id.slice(0, 8)}...</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isWaiting ? "bg-amber-500/10 text-amber-500" : 
          isFinished ? "bg-slate-800 text-slate-500" : 
          "bg-cyan-500/10 text-cyan-500"
        }`}>
          {match.status.replace("_", " ")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <PlayerBadge name="Alice" isActive={match.current_player === "Alice" && !isFinished} isWinner={match.winner === "Alice"} />
        <PlayerBadge name={isWaiting ? "???" : "Bob"} isActive={match.current_player === "Bob" && !isFinished} isWinner={match.winner === "Bob"} />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-600 uppercase">Param S</span>
          <span className="text-lg font-black text-cyan-400/80">{match.s_value}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-600 uppercase">Total Moves</span>
          <span className="text-lg font-black text-white">{match.move_count}</span>
        </div>
      </div>
      
      {!isWaiting && !isFinished && (
        <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse" 
            style={{ width: `${(match.move_count % 10) * 10 || 10}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}

function PlayerBadge({ name, isActive, isWinner }: { name: string, isActive: boolean, isWinner?: boolean }) {
  return (
    <div className={`p-3 rounded-2xl border transition-all ${
      isWinner 
        ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20" 
        : isActive 
          ? "bg-cyan-500/10 border-cyan-400/30" 
          : "bg-slate-950/50 border-slate-800"
    }`}>
      <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
        Player
        {isWinner && <span className="text-emerald-500 text-[8px] font-black bg-emerald-500/10 px-1 rounded-sm">WINNER</span>}
      </div>
      <div className={`font-black tracking-tight flex items-center gap-2 ${isWinner ? "text-emerald-400" : isActive ? "text-cyan-400" : "text-slate-400"}`}>
        {isActive && !isWinner && <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>}
        {name}
      </div>
    </div>
  );
}
