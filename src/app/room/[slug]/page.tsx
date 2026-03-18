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
      .on("broadcast", { event: "move" }, (payload) => {
        // High-speed update from opponent's broadcast
        const { matchState, nextPlayer } = payload.payload;
        setMatch(prev => prev ? {
          ...prev,
          state: matchState,
          current_player: nextPlayer
        } : null);
      })
      .subscribe();
roadcast", { event: "move" }, (payload) => {
        // High-speed update from opponent's broadcast
        const { matchState, nextPlayer } = payload.payload;
        setMatch(prev => prev ? {
          ...prev,
          state: matchState,
          current_player: nextPlayer
        } : null);
      })
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

    // Optimistic Update: Predict next position
    const currentPos = match.state.pos;
    if (!currentPos) return;

    let nextPos = { ...currentPos };
    if (direction === "up") nextPos.x--;
    else if (direction === "down") nextPos.x++;
    else if (direction === "left") nextPos.y--;
    else if (direction === "right") nextPos.y++;

    // Local state slice for instant feedback
    const nextRemoved = [...match.state.removed];
    nextRemoved[currentPos.x] = [...nextRemoved[currentPos.x]];
    nextRemoved[currentPos.x][currentPos.y] = true;

    setMatch(prev => {
      if (!prev) return null;
      return {
        ...prev,
        state: {
          ...prev.state,
          pos: nextPos,
          removed: nextRemoved
        },
        current_player: role === "Alice" ? "Bob" : "Alice" // Swap turn locally
      };
    });

    move(match.id, direction).catch(err => {
      // Revert handle by alerting (or background refresh)
      alert(`ล้มเหลวในการส่งข้อมูล: ${err.message}`);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (match?.status !== "playing") return;
      
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") handleMove("up");
      else if (key === "s" || key === "arrowdown") handleMove("down");
      else if (key === "a" || key === "arrowleft") handleMove("left");
      else if (key === "d" || key === "arrowright") handleMove("right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [match?.status, handleMove]);

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
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🏆</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">หมายเลขห้อง</p>
              <h1 className="text-2xl font-black text-indigo-600 tracking-tighter">{slug}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-6 py-2.5 rounded-2xl text-sm font-bold border transition-all shadow-sm ${
              role === "Observer" ? "bg-slate-800 text-white border-slate-900" :
              isMyTurn ? "bg-indigo-600 text-white border-indigo-600 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"
            }`}>
              {role === "Observer" ? "โหมดผู้ดูแล (Spectator)" :
               match.status === "finished" ? "จบการแข่งขัน" : 
               isMyTurn ? "ตาของคุณแล้ว!" : `รอผู้เล่น ${match.current_player === "Alice" ? "อลิซ" : "บ็อบ"}`}
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
                <div className={`p-4 rounded-2xl border transition-all ${
                  role === "Observer" ? "bg-slate-50 border-slate-200" :
                  role === "Alice" ? "bg-indigo-50/50 border-indigo-200" : "bg-blue-50/50 border-blue-200"
                }`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">ตำแหน่ง</p>
                  <p className="font-bold text-slate-800">
                    {role === "Observer" ? "ผู้ดูแลห้อง (Admin)" :
                     role === "Alice" ? "เจ้าบ้าน (อลิซ)" : "ผู้ท้าชิง (บ็อบ)"}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">จำนวนการเดิน</p>
                  <p className="font-bold text-slate-800">{match.move_count} ครั้ง</p>
                </div>
              </div>
            </div>

            <div className={`rounded-[2.5rem] p-8 shadow-xl text-white ${role === "Observer" ? "bg-slate-800" : "bg-indigo-600"}`}>
              <h3 className="text-lg font-bold mb-4 border-b border-white/20 pb-2">
                {role === "Observer" ? "มุมมองผู้ดูแล" : "วิธีเล่น"}
              </h3>
              <div className="space-y-4 text-sm text-white/90 leading-relaxed">
                {role === "Observer" ? (
                  <p>คุณกำลังรับชมการต่อสู้ในฐานะผู้ดูแลห้อง คุณไม่สามารถแทรกแซงการเล่นได้ แต่สามารถดูสถิติและสถานะการเดินของเบี้ยแบบเรียลไทม์</p>
                ) : (
                  <>
                    <p><span className="font-bold text-white">1. เตรียมสมรภูมิ:</span> สนามรบจะถูกลบพื้นที่บางส่วนตามสูตรคณิตศาสตร์</p>
                    <p><span className="font-bold text-white">2. วางเบี้ย:</span> เจ้าบ้าน (อลิซ) เลือกจุดเริ่มต้นเพื่อวางเบี้ยและเริ่มเกม</p>
                    <p><span className="font-bold text-white">3. การเคลื่อนที่:</span> ผลัดกันเดินไปยังช่องที่ติดกัน (บน, ล่าง, ซ้าย, ขวา)</p>
                    <p><span className="font-bold text-white">4. กฎการทำลาย:</span> ช่องที่เดินผ่านไปแล้วจะถูกทำลายทิ้งทันที!</p>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* Center: Grid Area */}
          <section className="lg:col-span-6 flex flex-col items-center">
            {match.status === "waiting_for_opponent" ? (
              <div className="w-full bg-white rounded-[3rem] p-12 shadow-xl border-2 border-dashed border-slate-200 text-center animate-fadeIn">
                <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <span className="text-5xl animate-pulse">⏳</span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4">รอผู้ท้าชิง...</h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                  ขณะนี้กำลังรอผู้เล่นคนที่ 2 เข้าร่วมสมรภูมิ<br/>
                  โปรดแชร์หมายเลขห้อง <span className="text-indigo-600 font-black">{slug}</span> ให้เพื่อนของคุณ
                </p>
                <div className="inline-block px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">สถานะปัจจุบัน</p>
                  <p className="text-slate-600 font-bold">อลิซ (Alice) เชื่อมต่อแล้ว ✅</p>
                </div>
              </div>
            ) : (
              <GameGrid
                grid={match.state.grid}
                removed={match.state.removed}
                pos={match.state.pos}
                onCellClick={handleCellClick}
                onMove={handleMove}
                isMyTurn={isMyTurn}
                status={match.status}
              />
            )}
          </section>

          {/* Right Side: Log & Controls */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 h-full min-h-[400px] flex flex-col">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3 italic">บันทึกเหตุการณ์</h2>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex gap-3">
                  <span className="text-indigo-500 font-bold shrink-0">#</span>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">เริ่มต้นสมรภูมิ {match.state.grid.length}x{match.state.grid[0].length}</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-indigo-500 font-bold shrink-0">#</span>
                  <p className="text-[13px] text-slate-600 leading-relaxed font-medium">ตั้งค่าพื้นที่ s = {match.s_value}</p>
                </div>
                {match.status === "placing" && (
                  <div className="flex gap-3 animate-pulse">
                    <span className="text-amber-500 font-bold shrink-0">!</span>
                    <p className="text-[13px] text-amber-600 leading-relaxed font-bold">รออลิซวางเบี้ยจุติ...</p>
                  </div>
                )}
                {match.move_count > 0 && (
                  <div className="flex gap-3">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <p className="text-[13px] text-emerald-600 leading-relaxed font-bold">การต่อสู้เริ่มขึ้นแล้ว!</p>
                  </div>
                )}
                {match.status === "finished" && (
                  <div className="flex gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                    <span className="text-xl">👑</span>
                    <p className="text-[13px] text-indigo-700 leading-tight font-bold">การต่อสู้สิ้นสุด<br/>{match.winner === "Alice" ? "อลิซ" : "บ็อบ"} เป็นผู้ชนะ!</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

      </div>

      <GameOverModal
        isOpen={match.status === "finished"}
        winner={match.winner}
        onClose={() => {
          if (role === "Observer") {
            router.push(`/host/${slug}`);
          } else {
            router.push("/");
          }
        }}
        match={match}
        currentRole={role}
      />
    </main>
  );
}
