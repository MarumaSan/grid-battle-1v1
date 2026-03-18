"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGameSync } from "@/hooks/useGameSync";
import { Match, PlayerRole } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import GameGrid from "@/components/GameGrid";
import PlayerInfo from "@/components/PlayerInfo";
import WaitingRoom from "@/components/WaitingRoom";
import GameOverModal from "@/components/GameOverModal";

export default function RoomPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { joinRoom, placePawn, move, playerIdentifier } = useGameSync();

  const [match, setMatch] = useState<Match | null>(null);
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial Join
  useEffect(() => {
    if (!playerIdentifier || !slug) return;

    const init = async () => {
      try {
        const data = await joinRoom(slug);
        if (data) {
          setRole(data.role);
          setMatch(data.match);
        }
      } catch (err) {
        setError("Could not join room. It may be full or closed.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [slug, joinRoom, playerIdentifier]);

  // 2. Realtime sync
  useEffect(() => {
    if (!match?.id) return;

    const channel = supabase
      .channel(`match:${match.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "gb_matches",
          filter: `id=eq.${match.id}`,
        },
        (payload) => {
          setMatch(payload.new as Match);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id]);

  const handleCellClick = (x: number, y: number) => {
    if (!match || !role) return;

    if (match.status === "placing" && role === "Alice") {
      placePawn(match.id, { x, y });
    }
  };

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    if (!match || !role) return;
    const isMyTurn = match.current_player === role;
    if (!isMyTurn) return;
    move(match.id, direction);
  };

  if (loading) return <WaitingRoom message="Connecting to arena..." />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button onClick={() => router.push("/")} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          Back to Home
        </button>
      </div>
    </div>
  );

  if (!match) return <WaitingRoom message="Initializing match..." />;

  if (match.status === "waiting_for_opponent") {
    return <WaitingRoom message="Waiting for an opponent to join..." />;
  }

  const isMyTurn = match.current_player === role;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <PlayerInfo 
          role={role} 
          currentPlayer={match.current_player} 
          moveCount={match.move_count} 
        />

        <div className="flex flex-col items-center gap-6">
          <GameGrid
            grid={match.state.grid}
            removed={match.state.removed}
            pos={match.state.pos}
            onCellClick={handleCellClick}
            onMove={handleMove}
            isMyTurn={isMyTurn}
            status={match.status}
          />
          
          <div className="text-center text-slate-500 text-sm font-medium animate-pulse">
            {match.status === "placing" 
              ? (role === "Alice" ? "Choose your starting position" : "Alice is choosing starting position...")
              : (isMyTurn ? "Your turn! Use arrow keys or click adjacent cells." : `Waiting for ${match.current_player}...`)
            }
          </div>
        </div>
      </div>

      <GameOverModal
        isOpen={match.status === "finished"}
        winner={match.winner as PlayerRole}
        role={role as PlayerRole}
        moveCount={match.move_count}
        onClose={() => router.push("/")}
      />
    </main>
  );
}
