"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameSync } from "@/hooks/useGameSync";
import { RoomConfig } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { createRoom } = useGameSync();
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [config, setConfig] = useState<RoomConfig>({ N: 5, M: 5, p: 2, q: 3, sList: [3, 5, 7] });
  const [sInput, setSInput] = useState("3, 5, 7");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sList = sInput.split(",").map((s) => parseInt(s.trim())).filter((s) => !isNaN(s));
      const finalConfig = { ...config, sList };
      const { roomId } = await createRoom(finalConfig);
      router.push(`/host/${roomId}`);
    } catch (err: any) {
      alert(`ล้มเหลวในการสร้างห้อง: ${err.message}`);
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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch animate-fadeIn">

        {/* Left Side: Create Room */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              สร้างการต่อสู้
            </h1>
            <p className="text-slate-500 text-lg">กำหนดค่าสมรภูมิและเริ่มเกมใหม่</p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">แถว (N)</label>
                <input
                  type="number"
                  value={config.N}
                  onChange={(e) => setConfig({ ...config, N: parseInt(e.target.value) })}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 focus:border-blue-500 focus:outline-none transition-all text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">คอลัมน์ (M)</label>
                <input
                  type="number"
                  value={config.M}
                  onChange={(e) => setConfig({ ...config, M: parseInt(e.target.value) })}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 focus:border-blue-500 focus:outline-none transition-all text-lg font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">ค่า p</label>
                <input
                  type="number"
                  value={config.p}
                  onChange={(e) => setConfig({ ...config, p: parseInt(e.target.value) })}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 focus:border-blue-500 focus:outline-none transition-all text-lg font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">ค่า q</label>
                <input
                  type="number"
                  value={config.q}
                  onChange={(e) => setConfig({ ...config, q: parseInt(e.target.value) })}
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 focus:border-blue-500 focus:outline-none transition-all text-lg font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">รายการค่า s (คั่นด้วยคอมมา)</label>
              <input
                type="text"
                value={sInput}
                onChange={(e) => setSInput(e.target.value)}
                className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 focus:border-blue-500 focus:outline-none transition-all text-lg font-medium"
                placeholder="3, 5, 7"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-2xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {loading ? "กำลังสร้าง..." : "สร้างห้องใหม่"}
            </button>
          </form>
        </section>

        {/* Right Side: Join Room */}
        <section className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 shadow-xl flex flex-col text-white">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">เข้าร่วมสมรภูมิ</h2>
            <p className="text-indigo-100 text-lg opacity-80">ระบุรหัสห้องเพื่อเริ่มการต่อสู้ 1v1</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-100 ml-1">รหัสห้อง (Room Code)</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="ป้อนรหัส 6 หลัก"
                className="w-full h-20 bg-white/10 border-2 border-white/20 rounded-3xl px-6 text-3xl font-bold tracking-widest placeholder:text-white/30 placeholder:text-xl placeholder:font-normal focus:bg-white/20 focus:outline-none transition-all text-center uppercase"
              />
            </div>

            <button
              type="submit"
              className="w-full h-16 bg-white text-indigo-700 font-bold text-xl rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
              เข้าสู่สนามรบ
            </button>
          </form>

          <div className="mt-8 p-6 bg-white/5 rounded-3xl border border-white/10 hidden md:block">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-2">กฎการเล่นเบื้องต้น</h3>
            <p className="text-sm text-indigo-100/70 leading-relaxed">
              สลับกันเดินเบี้ยในสมรภูมิที่ถูกลบไปบางส่วนตามสูตรคณิตศาสตร์ ใครไม่สามารถเดินเบี้ยได้ต่อไปเป็นผู้แพ้
            </p>
          </div>
        </section>
      </div>

      <footer className="mt-12 text-slate-400 text-sm font-medium">
        © Create By Group 6
      </footer>
    </main>
  );
}
