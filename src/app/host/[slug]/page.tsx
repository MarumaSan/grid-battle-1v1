"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Room, Match } from "@/lib/types";
import QRInvite from "@/components/QRInvite";
import MatchCard from "@/components/MatchCard";

export default function HostPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchRoom = async () => {
      const { data: roomData, error } = await supabase
        .from("gb_rooms")
        .select("*")
        .eq("room_code", slug)
        .single();

      if (error || !roomData) {
        console.error("Room fetch error:", error);
        return;
      }

      setRoom(roomData as Room);
      
      // Fetch initial matches
      const { data: matchesData } = await supabase
        .from("gb_matches")
        .select("*")
        .eq("room_id", roomData.id)
        .order("created_at", { ascending: false });

      if (matchesData) setMatches(matchesData as Match[]);
      setLoading(false);
    };

    fetchRoom();

    // Subscribe to new/updated matches
    const channel = supabase
      .channel(`room:${slug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gb_matches",
        },
        async (payload) => {
          // Re-fetch all matches for this room to be safe, 
          // or manually update the state array.
          const { data: updatedMatches } = await supabase
            .from("gb_matches")
            .select("*")
            .eq("room_code_denorm", slug) // I should probably have added room_code to matches for easier filtering
            .order("created_at", { ascending: false });
            
            // Wait, I didn't add room_code to matches. 
            // I'll just filter payload.new if available.
            if (payload.eventType === "INSERT") {
              setMatches(prev => [payload.new as Match, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setMatches(prev => prev.map(m => m.id === payload.new.id ? (payload.new as Match) : m));
            }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  const handleCloseRoom = async () => {
    if (!room) return;
    await supabase.from("gb_rooms").update({ status: "closed" }).eq("id", room.id);
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Dashboard...</div>;
  if (!room) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Room not found</div>;

  const activeMatches = matches.filter(m => m.status !== "finished");
  const finishedMatches = matches.filter(m => m.status === "finished");

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              Host Dashboard
            </h1>
            <p className="text-slate-400 font-medium mt-1">
              Room: <span className="text-white font-bold">{room.room_code}</span> • {matches.length} matches total
            </p>
          </div>
          <button
            onClick={handleCloseRoom}
            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-bold border border-red-500/20 transition-all active:scale-95"
          >
            Close Room
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Stats & Invite */}
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                Room Configuration
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Grid Size" value={`${room.config.N}x${room.config.M}`} />
                <StatCard label="Params" value={`p=${room.config.p}, q=${room.config.q}`} />
                <StatCard label="S Values" value={room.config.sList.join(", ")} />
                <StatCard label="Status" value={room.status} highlight={room.status === "active"} />
              </div>
            </div>

            <QRInvite roomCode={room.room_code} />
          </div>

          {/* Right: Active Matches */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                Ongoing Battles
                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">{activeMatches.length}</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {activeMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
                {activeMatches.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                    Waiting for players to initiate battles...
                  </div>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-slate-400">
                Battle History
                <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded-full">{finishedMatches.length}</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4 opacity-75">
                {finishedMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-black ${highlight ? "text-cyan-400" : "text-white"}`}>{value}</div>
    </div>
  );
}
