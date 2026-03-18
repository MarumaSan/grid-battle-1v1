"use client";

import React from "react";
import { PlayerRole, Match } from "@/lib/types";

interface GameOverModalProps {
  isOpen: boolean;
  winner: PlayerRole | null;
  onClose: () => void;
  match: Match;
}

export default function GameOverModal({ isOpen, winner, onClose, match }: GameOverModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-fadeIn">
        
        {/* Header with Winner Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="text-7xl mb-6 transform hover:scale-110 transition-transform cursor-default">🏆</div>
          <h2 className="text-4xl font-black text-white tracking-tighter mb-2">จบการต่อสู้!</h2>
          <p className="text-indigo-100 text-lg opacity-80 uppercase tracking-widest font-bold">ผู้ชนะการประลอง</p>
        </div>

        {/* Content */}
        <div className="p-10 pt-12 text-center bg-white">
          <div className="inline-block px-10 py-5 bg-indigo-50 rounded-3xl border-2 border-indigo-100 mb-10">
            <p className="text-5xl font-black text-indigo-600 tracking-tighter leading-none">
              {winner === "Alice" ? "คุณอลิซ (Alice)" : "คุณบ็อบ (Bob)"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">จำนวนตาที่เดิน</p>
              <p className="text-2xl font-black text-slate-800">{match.move_count}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">รหัสสมรภูมิ</p>
              <p className="text-2xl font-black text-slate-800">{match.s_value}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full h-16 bg-slate-900 hover:bg-black text-white font-bold text-xl rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            กลับสู่หน้าหลัก
          </button>
          
          <p className="mt-6 text-slate-400 text-sm font-medium">ขอบคุณที่ร่วมพิชิตตารางไปกับเรา!</p>
        </div>
      </div>
    </div>
  );
}
