"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import type { RoomConfig } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const socket = useSocket();
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [joinCode, setJoinCode] = useState("");

  // Create room form state
  const [N, setN] = useState(6);
  const [M, setM] = useState(6);
  const [p, setP] = useState(2);
  const [q, setQ] = useState(3);
  const [sInput, setSInput] = useState("2, 3, 5, 7");

  const handleCreateRoom = () => {
    if (!socket) return;

    const sList = sInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((s) => !isNaN(s) && s > 1);

    if (sList.length === 0) return;

    const config: RoomConfig = { N, M, p, q, sList };

    socket.emit("create-room", { config });

    socket.once("room-created", ({ roomId }) => {
      router.push(`/host/${roomId}`);
    });
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    router.push(`/room/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-3">
            Grid Battle
          </h1>
          <p className="text-gray-400 text-lg">
            1v1 Strategic Grid Game
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <span>♟️ Move</span>
            <span>·</span>
            <span>💥 Destroy</span>
            <span>·</span>
            <span>🏆 Trap</span>
          </div>
        </div>

        {/* Mode: Home */}
        {mode === "home" && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <button
              onClick={() => setMode("create")}
              className="group relative w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              <span className="relative z-10">🎮 Create Room</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </button>

            <button
              onClick={() => setMode("join")}
              className="w-full py-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white font-bold text-lg hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.02]"
            >
              🚀 Join Room
            </button>
          </div>
        )}

        {/* Mode: Create */}
        {mode === "create" && (
          <div className="animate-fadeIn">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">Create Room</h2>
                <button
                  onClick={() => setMode("home")}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>

              <div className="space-y-5">
                {/* Grid Size */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Grid Size (N × M)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-gray-500 text-xs mb-1">Rows (N)</label>
                      <input
                        type="number"
                        value={N}
                        onChange={(e) => setN(Math.max(2, parseInt(e.target.value) || 2))}
                        min={2}
                        max={50}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      />
                    </div>
                    <div className="flex items-end pb-3 text-gray-500 font-bold">×</div>
                    <div className="flex-1">
                      <label className="block text-gray-500 text-xs mb-1">Cols (M)</label>
                      <input
                        type="number"
                        value={M}
                        onChange={(e) => setM(Math.max(2, parseInt(e.target.value) || 2))}
                        min={2}
                        max={50}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Primes p, q */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Primes (p, q)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-gray-500 text-xs mb-1">p</label>
                      <input
                        type="number"
                        value={p}
                        onChange={(e) => setP(Math.max(2, parseInt(e.target.value) || 2))}
                        min={2}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-500 text-xs mb-1">q</label>
                      <input
                        type="number"
                        value={q}
                        onChange={(e) => setQ(Math.max(2, parseInt(e.target.value) || 2))}
                        min={2}
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* s values */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    S Values <span className="text-gray-500 text-xs">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={sInput}
                    onChange={(e) => setSInput(e.target.value)}
                    placeholder="2, 3, 5, 7, 11"
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors font-mono"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Each match pair will get a random s from this list
                  </p>
                </div>

                {/* Formula preview */}
                <div className="px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <p className="text-cyan-300 text-xs font-mono">
                    Cell (i,j) removed if (p<sup>i</sup> + q<sup>j</sup>) mod s = 0
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Grid: {N}×{M} | p={p}, q={q} | s ∈ {`{${sInput}}`}
                  </p>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  Create Room 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mode: Join */}
        {mode === "join" && (
          <div className="animate-fadeIn">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-xl">Join Room</h2>
                <button
                  onClick={() => setMode("home")}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Back
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-6 py-4 rounded-xl bg-black/40 border border-white/10 text-white text-center font-mono text-2xl tracking-[0.5em] placeholder:text-gray-600 placeholder:text-base placeholder:tracking-normal focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-colors"
                    onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={!joinCode.trim()}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg hover:from-purple-400 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  Join Room 🎯
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-xs">
          <p>p<sup>i</sup> + q<sup>j</sup> mod s = 0 → cell removed</p>
          <p className="mt-1">Alice & Bob take turns · Trap your opponent to win</p>
        </div>
      </div>
    </div>
  );
}
