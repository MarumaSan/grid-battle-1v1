"use client";

import React from "react";
import { Match, MatchStatus } from "@/lib/types";
import { useRouter } from "next/navigation";

interface MatchCardProps {
  match: Match;
  roomCode: string;
}

export default function MatchCard({ match, roomCode }: MatchCardProps) {
  const router = useRouter();
  
  const getStatusInfo = (status: MatchStatus) => {
    switch (status) {
      case "waiting_for_opponent":
        return { label: "รอคู่ต่อสู้", color: "bg-amber-100 text-amber-700 border-amber-200" };
      case "placing":
        return { label: "กำลังวางเบี้ย", color: "bg-blue-100 text-blue-700 border-blue-200" };
      case "playing":
        return { label: "กำลังต่อสู้", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case "finished":
        return { label: "จบการต่อสู้", color: "bg-slate-100 text-slate-700 border-slate-200" };
      default:
        return { label: "ไม่ทราบสถานะ", color: "bg-slate-100 text-slate-700" };
    }
  };

  const statusInfo = getStatusInfo(match.status);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">รหัสห้อง</p>
          <p className="text-2xl font-black text-slate-800 tracking-tighter">{roomCode}</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ผู้เล่น อลิซ (Alice)</span>
            <span className="font-bold text-slate-700 truncate max-w-[120px]">
              {match.alice_id ? "เชื่อมต่อแล้ว" : "รอดาวน์โหลด..."}
            </span>
          </div>
          <div className="text-2xl">⚔️</div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ผู้เล่น บ็อบ (Bob)</span>
            <span className="font-bold text-slate-700 truncate max-w-[120px]">
              {match.bob_id ? "เชื่อมต่อแล้ว" : "ยังไม่มีคนเข้า"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-blue-50/50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-blue-400 mb-1">ตาผู้เล่น</p>
            <p className="font-bold text-blue-700">
              {match.status === "finished" ? "-" : match.current_player === "Alice" ? "อลิซ" : "บ็อบ"}
            </p>
          </div>
          <div className="p-3 bg-indigo-50/50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1">จำนวนตา</p>
            <p className="font-bold text-indigo-700">{match.move_count}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/room/${roomCode}`)}
          className="flex-1 h-12 bg-slate-800 hover:bg-black text-white text-sm font-bold rounded-xl transition-all active:scale-95"
        >
          เข้าดูห้อง
        </button>
        {match.status === "finished" && (
          <div className="px-4 flex items-center bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100">
            🥇 {match.winner} ชนะ!
          </div>
        )}
      </div>
    </div>
  );
}
