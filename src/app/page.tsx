"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameSync } from "@/hooks/useGameSync";
import { RoomConfig } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { createRoom } = useGameSync();
  const [roomCode, setRoomCode] = useState("");
  const [config, setConfig] = useState<RoomConfig>({
    N: 5,
    M: 5,
    p: 2,
    q: 3,
    sList: [2, 3, 5],
  });
  const [sInput, setSInput] = useState("2, 3, 5");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sList = sInput.split(",").map((s) => parseInt(s.trim())).filter((s) => !isNaN(s));
      const finalConfig = { ...config, sList };
      const { roomId } = await createRoom(finalConfig);
      router.push(`/host/${roomId}`);
    } catch (err) {
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/room/${roomCode.trim().toUpperCase()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <header className="mb-12 text-center animate-fadeIn">
        <h1 className="text-6xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
          GRID BATTLE 1v1
        </h1>
        <p className="text-slate-400 font-medium">Strategic Territory Conquest</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl animate-fadeInDelay">
        {/* Create Room */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl hover:border-purple-500/50 transition-all duration-500 group">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
            <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
            Create New Room
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Grid Size (N x M)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={config.N}
                    onChange={(e) => setConfig({ ...config, N: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="N"
                    required
                  />
                  <input
                    type="number"
                    value={config.M}
                    onChange={(e) => setConfig({ ...config, M: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="M"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Parameters (p, q)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={config.p}
                    onChange={(e) => setConfig({ ...config, p: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="p"
                    required
                  />
                  <input
                    type="number"
                    value={config.q}
                    onChange={(e) => setConfig({ ...config, q: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="q"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">S Values (comma separated)</label>
              <input
                type="text"
                value={sInput}
                onChange={(e) => setSInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="e.g. 2, 3, 5"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transform active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  Start Hosting
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Join Room */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl hover:border-cyan-500/50 transition-all duration-500 group flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
            <span className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </span>
            Join Battle
          </h2>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Enter Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl font-black tracking-widest text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all uppercase"
                placeholder="X7Y2Z9"
                maxLength={8}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-900/20 transform active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              Enter Arena
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">Waiting for an invite? Join a public room if available.</p>
          </div>
        </div>
      </div>
      
      <footer className="mt-16 text-slate-600 text-xs font-medium tracking-widest uppercase flex items-center gap-8">
        <span>Real-time Multiplayer</span>
        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
        <span>Secure Matches</span>
        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
        <span>Zero Lag</span>
      </footer>
    </main>
  );
}
