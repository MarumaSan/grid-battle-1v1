"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Match, PlayerRole } from "@/lib/types";
import { useGameSync } from "@/hooks/useGameSync";
import GameGrid from "@/components/GameGrid";
import GameOverModal from "@/components/GameOverModal";
import WaitingRoom from "@/components/WaitingRoom";

export default function RoomPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { playerIdentifier, joinRoom, placePawn, move } = useGameSync();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerIdentifier || !slug) return;

    const init = async () => {
      try {
        const res = await joinRoom(slug);
        if (res) {
          setMatch(res.match);
          setRole(res.role);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();

    const channel = supabase
      .channel(`match-${slug}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "gb_matches" },
        (payload) => {
          const updated = payload.new as Match;
          setMatch(updated);
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [playerIdentifier, slug, joinRoom]);

  const handleCellClick = (x: number, y: number) => {
    if (!match || !role) return;
    if (match.status === "placing" && role === "Alice" && match.current_player === "Alice") {
      placePawn(match.id, { x, y }).catch(err => alert(err.message));
    }
  };

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    if (!match || !role) return;
    const isMyTurn = match.current_player === role;
    if (!isMyTurn || match.status !== "playing") return;
    move(match.id, direction).catch(err => alert(err.message));
  };

  if (loading) return <WaitingRoom message="กำลังโหลดข้อมูลสมรภูมิ..." />;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">เกิดข้อผิดพลาด</h1>
      <p className="text-slate-500 mb-8">{error}</p>
      <button onClick={() => router.push("/")} className="px-8 h-12 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">
        กลับหน้าแรก
      </button>
    </div>
  );
  if (!match) return <WaitingRoom message="กำลังหาห้องของคุณ..." />;

  const isMyTurn = match.status !== "finished" && match.current_player === role;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-12 font-sans overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-fadeIn">
        
        {/* Top Info Bar */}
        <header className="w-full flex items-center justify-between bg-white px-8 py-5 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">🏛️</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">รหัสสมรภูมิ</p>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter">{slug}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-2 rounded-full text-sm font-bold border transition-all ${
              isMyTurn ? "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"
            }`}>
              {match.status === "finished" ? "จบการแข่งขัน" : isMyTurn ? "ตาของคุณแล้ว!" : `รอผู้เล่น ${match.current_player}`}
            </div>
          </div>
        </header>

        {/* Main Content Areas */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Stats & Info */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3">ข้อมูลผู้เล่น</h2>
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border transition-all ${role === "Alice" ? "bg-indigo-50/50 border-indigo-200" : "bg-slate-50 border-slate-100"}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ตำแหน่ง</p>
                  <p className="font-bold text-slate-800">{role === "Alice" ? "เจ้าบ้าน (Alice)" : "ผู้ท้าชิง (Bob)"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">จำนวนการเดิน</p>
                  <p className="font-bold text-slate-800">{match.move_count} ครั้ง</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-xl text-white">
              <h3 className="text-lg font-bold mb-4">วิธีเล่น</h3>
              <p className="text-sm text-indigo-100/80 leading-relaxed mb-6">
                {match.status === "placing" 
                  ? "Alice ต้องเลือกช่องเแรกเพื่อวางเบี้ยและเริ่มการต่อสู้" 
                  : "คลิกช่องรอบๆ ตัว หรือใช้ปุ่มลูกศรเพื่อเคลื่อนที่เบี้ย ช่องที่ถูกเหยียบจะถูกทำลาย!"}
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">W</div>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">A</div>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">S</div>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">D</div>
              </div>
            </div>
          </aside>

          {/* Center: Grid Area */}
          <section className="lg:col-span-6 flex flex-col items-center">
            <GameGrid
              grid={match.state.grid}
              removed={match.state.removed}
              pos={match.state.pos}
              onCellClick={handleCellClick}
              onMove={handleMove}
              isMyTurn={isMyTurn}
              status={match.status}
            />
          </section>

          {/* Right Side: Log & Controls */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 h-full min-h-[400px]">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3">เหตุการณ์ในสนาม</h2>
              <div className="space-y-3 opacity-60">
                <p className="text-xs leading-relaxed"><span className="text-indigo-600 font-bold"># ระบบ:</span> สร้างสมรภูมิขนาด {match.state.grid.length}x{match.state.grid[0].length}</p>
                <p className="text-xs leading-relaxed"><span className="text-indigo-600 font-bold"># สูตร:</span> ใช้ค่า s = {match.s_value} ในการสุ่มพื้นที่</p>
                {match.status === "placing" && <p className="text-xs leading-relaxed animate-pulse">รอ Alice วางเบี้ยเริ่มต้น...</p>}
                {match.move_count > 0 && <p className="text-xs leading-relaxed">เริ่มการต่อสู้อย่างเป็นทางการ!</p>}
              </div>
            </div>
          </aside>
        </div>

      </div>

      <GameOverModal
        isOpen={match.status === "finished"}
        winner={match.winner}
        onClose={() => router.push("/")}
        match={match}
      />
    </main>
  );
}
