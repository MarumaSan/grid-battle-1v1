"use client";

import React from "react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface QRInviteProps {
  roomCode: string;
}

export default function QRInvite({ roomCode }: QRInviteProps) {
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    const url = `${window.location.origin}/room/${roomCode}`;
    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#1e1b4b", // Indigo 950
        light: "#ffffff"
      }
    }).then(setQr);
  }, [roomCode]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 p-4 bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-100">
        {qr ? (
          <img src={qr} alt="QR Code" className="w-52 h-52 object-contain" />
        ) : (
          <div className="w-52 h-52 bg-slate-100 animate-pulse rounded-2xl" />
        )}
      </div>
      <div className="space-y-4 text-center">
        <h4 className="text-lg font-bold text-slate-800">เชิญเพื่อนเข้าสู่สนาม</h4>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[240px]">
          สแกนคิวอาร์โค้ดนี้ หรือระบุรหัส <br></br><span className="text-indigo-600 font-black">{roomCode}</span><br></br> เพื่อเริ่มการท้าทาย
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(roomCode);
            alert("คัดลอกรหัสห้องแล้ว!");
          }}
          className="px-6 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100 hover:bg-indigo-100 transition-all"
        >
          คัดลอกรหัสห้อง
        </button>
      </div>
    </div>
  );
}
