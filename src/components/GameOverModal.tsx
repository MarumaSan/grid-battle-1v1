"use client";

import React from "react";
import type { PlayerRole } from "@/lib/types";

interface GameOverModalProps {
  winner: PlayerRole;
  role: PlayerRole;
  moveCount: number;
  onClose: () => void;
}

export default function GameOverModal({ winner, role, moveCount, onClose }: GameOverModalProps) {
  const isWinner = winner === role;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={`relative p-8 rounded-3xl border-2 max-w-md w-full mx-4 ${
        isWinner
          ? "bg-gradient-to-br from-green-900/80 to-emerald-900/80 border-green-400/50"
          : "bg-gradient-to-br from-red-900/80 to-rose-900/80 border-red-400/50"
      } backdrop-blur-xl shadow-2xl`}>
        {/* Confetti-like particles for winner */}
        {isWinner && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  backgroundColor: ["#06b6d4", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899"][i % 5],
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">
            {isWinner ? "🏆" : "💀"}
          </div>

          <h2 className={`text-3xl font-black ${
            isWinner ? "text-green-300" : "text-red-300"
          }`}>
            {isWinner ? "VICTORY!" : "DEFEAT!"}
          </h2>

          <p className="text-gray-300 text-lg">
            {isWinner
              ? `You won as ${role}! Your opponent had no moves left.`
              : `${winner} wins! You were trapped with no valid moves.`}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
            <span>Total Moves: {moveCount}</span>
            <span>Winner: {winner}</span>
          </div>

          <button
            onClick={onClose}
            className={`mt-4 px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 ${
              isWinner
                ? "bg-green-500 text-white hover:bg-green-400 shadow-lg shadow-green-500/30"
                : "bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/30"
            }`}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
