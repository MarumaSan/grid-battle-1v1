"use client";

import React from "react";

interface WaitingRoomProps {
  message?: string;
}

export default function WaitingRoom({ message = "กำลังรอคู่ต่อสู้เข้าร่วม..." }: WaitingRoomProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center animate-fadeIn">
        <div className="relative mb-10">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
            <div className="text-5xl animate-bounce">⏳</div>
          </div>
          <div className="absolute top-0 left-1/2 -ml-12 w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-3">รอก่อนนะ...</h2>
        <p className="text-slate-500 text-lg leading-relaxed px-4">
          {message}
        </p>
        
        <div className="mt-12 pt-8 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
            เตรียมตัวให้พร้อมสำหรับการต่อสู้!
          </p>
        </div>
      </div>
    </div>
  );
}
