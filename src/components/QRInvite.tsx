"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRInviteProps {
  roomCode: string;
}

export default function QRInvite({ roomCode }: QRInviteProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const roomUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/room/${roomCode}` 
    : `/room/${roomCode}`;

  useEffect(() => {
    QRCode.toDataURL(roomUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: "#22d3ee", // cyan-400
        light: "#00000000", // transparent
      },
    }).then(setQrDataUrl);
  }, [roomUrl]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = roomCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 shadow-2xl">
      <div className="text-center">
        <h3 className="text-white text-lg font-black uppercase tracking-widest mb-1">
          Invite Players
        </h3>
        <p className="text-slate-500 text-xs font-medium">Scan QR or share the code below</p>
      </div>

      {/* QR Code */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Room QR Code" className="w-[160px] h-[160px] block" />
          ) : (
            <div className="w-[160px] h-[160px] bg-slate-900 animate-pulse rounded-lg" />
          )}
        </div>
      </div>

      {/* Room Code */}
      <div className="w-full space-y-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Room Code</label>
          <button
            onClick={copyCode}
            className="w-full px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-black text-3xl tracking-[0.3em] hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all active:scale-95 group relative overflow-hidden"
          >
            <span className="relative z-10">{roomCode}</span>
            <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors" />
          </button>
        </div>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className="w-full py-3 rounded-xl bg-slate-800/50 text-slate-300 text-sm font-bold hover:bg-slate-700/50 transition-all border border-slate-700/50 flex items-center justify-center gap-2 group active:scale-95"
        >
          {copied ? (
            <span className="text-emerald-400 flex items-center gap-2 animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Invite Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
