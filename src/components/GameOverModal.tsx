"use client";

import React from "react";
import { PlayerRole, Match } from "@/lib/types";

interface GameOverModalProps {
  isOpen: boolean;
  winner: PlayerRole | null;
  onClose: () => void;
  match: Match;
  currentRole: PlayerRole | null;
}

export default function GameOverModal({ isOpen, winner, onClose, match, currentRole }: GameOverModalProps) {
  if (!isOpen) return null;

  const isWinner = winner === currentRole;
  const winnerName = winner === "Alice" ? "อลิซ (Alice)" : "บ็อบ (Bob)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-fadeIn">
        
        {/* Header with Winner/Loser Banner */}
        <div className={`p-12 text-center relative overflow-hidden ${
          isWinner 
            ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700" 
            : "bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700"
        }`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="text-8xl mb-6 transform animate-bounce">
            {isWinner ? "🎊" : "💀"}
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-2">
            {isWinner ? "คุณชนะแล้ว!" : "คุณแพ้แล้ว..."}
          </h2>
          <p className="text-white/80 text-lg uppercase tracking-widest font-bold">
            {isWinner ? "สุดยอดฝีมือ!" : "พยายามเข้าในตาหน้านะ"}
          </p>
        </div>

        {/* Content */}
        <div className="p-10 pt-12 text-center bg-white">
          <div className={`inline-block px-10 py-5 rounded-3xl border-2 mb-10 ${
            isWinner ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
          }`}>
            <p className="text-sm font-bold uppercase tracking-widest mb-1">ผู้ชนะการประลอง</p>
            <p className="text-4xl font-black tracking-tighter leading-none italic">
              {winnerName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">จำนวนตาที่เดิน</p>
              <p className="text-2xl font-black text-slate-800">{match.move_count}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ค่า s ที่ใช้</p>
              <p className="text-2xl font-black text-slate-800">{match.s_value}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-xl rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {currentRole === "Observer" ? "กลับสู่แผงควบคุม" : "กลับสู่หน้าหลัก"}
          </button>
        </div>
      </div>
    </div>
  );
}
