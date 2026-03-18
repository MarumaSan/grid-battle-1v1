"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRInviteProps {
  roomId: string;
}

export default function QRInvite({ roomId }: QRInviteProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const roomUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/room/${roomId}` 
    : `/room/${roomId}`;

  useEffect(() => {
    QRCode.toDataURL(roomUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: "#06b6d4",
        light: "#00000000",
      },
    }).then(setQrDataUrl);
  }, [roomUrl]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = roomId;
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
    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
        Invite Players
      </h3>

      {/* QR Code */}
      {qrDataUrl && (
        <div className="p-3 rounded-xl bg-gray-900/80 border border-cyan-500/20">
          <img src={qrDataUrl} alt="Room QR Code" className="w-[180px] h-[180px]" />
        </div>
      )}

      {/* Room Code */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">Room Code:</span>
        <button
          onClick={copyCode}
          className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-lg tracking-widest hover:bg-cyan-500/30 transition-colors border border-cyan-500/30"
        >
          {roomId}
        </button>
      </div>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-2"
      >
        {copied ? "✅ Copied!" : "📋 Copy Link"}
      </button>

      <p className="text-gray-500 text-xs text-center max-w-[200px]">
        Share this code or scan the QR to join the room
      </p>
    </div>
  );
}
