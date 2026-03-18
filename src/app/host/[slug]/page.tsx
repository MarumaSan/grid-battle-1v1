"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import QRInvite from "@/components/QRInvite";
import MatchCard from "@/components/MatchCard";
import type { Room } from "@/lib/types";

export default function HostPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const roomId = params.slug as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.emit("host-join", { roomId });

    socket.on("host-update", ({ room: r }) => {
      setRoom(r);
      const totalPlayers = r.waitingQueue.length + r.matches.length * 2;
      setPlayerCount(totalPlayers);
    });

    socket.on("player-count", ({ count }) => {
      setPlayerCount(count);
    });

    socket.on("error", ({ message }) => {
      console.error("Host error:", message);
    });

    return () => {
      socket.off("host-update");
      socket.off("player-count");
      socket.off("error");
    };
  }, [socket, roomId]);

  const handleCloseRoom = () => {
    if (!socket) return;
    socket.emit("close-room", { roomId });
    setClosed(true);
  };

  if (closed) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
        <div className="text-center p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-white text-xl font-bold mb-2">Room Closed</h2>
          <p className="text-gray-400 mb-4">All players have been notified.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const activeMatches = room?.matches.filter((m) => m.status === "playing" || m.status === "placing") || [];
  const finishedMatches = room?.matches.filter((m) => m.status === "finished") || [];
  const waitingCount = room?.waitingQueue.length || 0;

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              Host Dashboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Room: <span className="font-mono text-cyan-400">{roomId}</span>
            </p>
          </div>

          <button
            onClick={handleCloseRoom}
            className="px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium"
          >
            🔒 Close Room
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: QR + Stats */}
          <div className="flex flex-col gap-4">
            <QRInvite roomId={roomId} />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-cyan-400">{playerCount}</div>
                <div className="text-gray-500 text-xs mt-1">Players</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-purple-400">{room?.matches.length || 0}</div>
                <div className="text-gray-500 text-xs mt-1">Matches</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-green-400">{activeMatches.length}</div>
                <div className="text-gray-500 text-xs mt-1">Active</div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="text-2xl font-black text-yellow-400">{waitingCount}</div>
                <div className="text-gray-500 text-xs mt-1">In Queue</div>
              </div>
            </div>

            {/* Config */}
            {room && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-gray-300 text-sm font-medium mb-3">Room Config</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Grid</span>
                    <span className="text-white font-mono">{room.config.N}×{room.config.M}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>p</span>
                    <span className="text-white font-mono">{room.config.p}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>q</span>
                    <span className="text-white font-mono">{room.config.q}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>S values</span>
                    <span className="text-white font-mono">{room.config.sList.join(", ")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Match List */}
          <div className="lg:col-span-2">
            {/* Active Matches */}
            <div className="mb-6">
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Active Matches
              </h2>
              {activeMatches.length === 0 ? (
                <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center text-gray-500 text-sm">
                  No active matches yet. Waiting for players to join...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeMatches.map((m) => (
                    <MatchCard key={m.matchId} match={m} />
                  ))}
                </div>
              )}
            </div>

            {/* Finished Matches */}
            {finishedMatches.length > 0 && (
              <div>
                <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Finished Matches
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {finishedMatches.map((m) => (
                    <MatchCard key={m.matchId} match={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Scoreboard */}
            {finishedMatches.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-white font-bold text-sm mb-3">📊 Scoreboard</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-black text-cyan-400">
                      {finishedMatches.filter((m) => m.winner === "Alice").length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Alice Wins</div>
                  </div>
                  <div className="text-gray-600 text-2xl font-thin">|</div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-purple-400">
                      {finishedMatches.filter((m) => m.winner === "Bob").length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Bob Wins</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
