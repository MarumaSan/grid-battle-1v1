"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Room, Match } from "@/lib/types";
import MatchCard from "@/components/MatchCard";
import QRInvite from "@/components/QRInvite";
import { useParams } from "next/navigation";

export default function HostPage() {
  const { slug } = useParams() as { slug: string };
  const [room, setRoom] = useState<Room | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchRoomData = async () => {
      // 1. Fetch Room
      const { data: roomData, error: roomError } = await supabase
        .from("gb_rooms")
        .select("*")
        .eq("room_code", slug)
        .single();
      
      if (roomError) {
        console.error("Room fetch error:", roomError);
        return;
      }
      setRoom(roomData as Room);

      // 2. Fetch Matches
      const { data: matchData, error: matchError } = await supabase
        .from("gb_matches")
        .select("*")
        .eq("room_id", roomData.id)
        .order("created_at", { ascending: false });

      if (!matchError) setMatches(matchData as Match[]);
      setLoading(false);
    };

    fetchRoomData();

    // 3. Realtime Subscription
    const channel = supabase
      .channel(`room-${slug}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gb_matches" },
        (payload) => {
          setMatches((prev) => {
            const updated = payload.new as Match;
            const index = prev.findIndex(m => m.id === updated.id);
            if (index === -1) return [updated, ...prev];
            const next = [...prev];
            next[index] = updated;
            return next;
          });
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
        ไม่พบข้อมูลห้อง โปรดลองใหม่อีกครั้ง
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12 animate-fadeIn">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-slate-200">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-800 tracking-tighter">แผงควบคุมสนามรบ</h1>
            <p className="text-slate-500 text-lg font-medium">จัดการและติดตามสถานะการต่อสู้ในห้องของคุณ</p>
          </div>
          <div className="flex items-center gap-4 bg-white px-8 py-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">รหัสห้องถาวร</p>
              <p className="text-4xl font-black text-blue-600 tracking-tighter">{room.room_code}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Dashboard: Matches */}
          <section className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">การต่อสู้ทั้งหมด ({matches.length})</h2>
              <div className="h-1 flex-1 mx-6 bg-slate-200 rounded-full" />
            </div>

            {matches.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีการต่อสู้เกิดขึ้น</h3>
                <p className="text-slate-500">แชร์รหัสห้องด้านขวากับเพื่อนๆ เพื่อเริ่มการประลอง!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} roomCode={room.room_code} />
                ))}
              </div>
            )}
          </section>

          {/* Sidebar: Invite & Info */}
          <aside className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 sticky top-12">
              <h2 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">เปิดรับคำขอท้าทาย</h2>
              
              <div className="space-y-8">
                <QRInvite roomCode={room.room_code} />
                
                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">การกำหนดค่า</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ขนาดตาราง</span>
                      <span className="font-bold text-slate-800">{room.config.N} x {room.config.M}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">ค่าคงที่ (p, q)</span>
                      <span className="font-bold text-slate-800">{room.config.p}, {room.config.q}</span>
                    </div>
                  </div>
                </div>

                {/* Management Section */}
                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">การจัดการห้อง</h3>
                  <button 
                    onClick={async () => {
                      if (confirm("คุณแน่ใจหรือไม่ว่าต้องการปิดห้องนี้และยุติการต่อสู้ทั้งหมด?")) {
                        await supabase.from("gb_rooms").delete().eq("id", room.id);
                        window.location.href = "/";
                      }
                    }}
                    className="w-full py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl border border-rose-100 hover:bg-rose-100 transition-all active:scale-95"
                  >
                    🚩 ปิดสมรภูมินี้
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </main>
  );
}
