"use client";

import React from "react";
import type { PlayerRole } from "@/lib/types";

interface GameOverModalProps {
  isOpen: boolean;
  winner: PlayerRole;
  role: PlayerRole;
  moveCount: number;
  onClose: () => void;
}

export default function GameOverModal({ isOpen, winner, role, moveCount, onClose }: GameOverModalProps) {
  if (!isOpen) return null;

  const isWinner = winner === role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn p-4">
      <div className={`relative p-10 rounded-[2.5rem] border-2 max-w-md w-full ${
        isWinner
          ? "bg-gradient-to-br from-emerald-950/90 to-slate-950/90 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          : "bg-gradient-to-br from-rose-950/90 to-slate-950/90 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.2)]"
      } backdrop-blur-2xl animate-scaleIn`}>
        
        {/* Animated Background Elements for Winner */}
        {isWinner && (
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-5%`,
                  backgroundColor: ["#22d3ee", "#818cf8", "#fbbf24", "#34d399", "#f472b6"][i % 5],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className={`text-7xl mb-2 ${isWinner ? "animate-bounce" : "animate-pulse"}`}>
              {isWinner ? "🏆" : "💀"}
            </div>
            {isWinner && (
              <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full -z-10 animate-pulse" />
            )}
          </div>

          <div>
            <h2 className={`text-4xl font-black tracking-tighter mb-2 ${
              isWinner ? "text-emerald-400" : "text-rose-400"
            }`}>
              {isWinner ? "VICTORY" : "DEFEAT"}
            </h2>
            <div className="h-1 w-12 bg-slate-800 rounded-full mx-auto" />
          </div>

          <p className="text-slate-300 font-medium leading-relaxed">
            {isWinner
              ? `Tremendous strategy! You've conquered the grid as ${role}.`
              : `A valiant effort, but ${winner} has outmaneuvered you this time.`}
          </p>

          <div className="w-full grid grid-cols-2 gap-4 my-2">
            <div className="bg-slate-900/50 py-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Moves</div>
              <div className="text-xl font-black text-white">{moveCount}</div>
            </div>
            <div className="bg-slate-900/50 py-3 rounded-2xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Winner</div>
              <div className="text-xl font-black text-white">{winner.charAt(0)}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl font-black text-lg tracking-wide transition-all active:scale-95 shadow-lg ${
              isWinner
                ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20"
                : "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20"
            }`}
          >
            EXIT TO LOBBY
          </button>
        </div>
      </div>
    </div>
  );
}
