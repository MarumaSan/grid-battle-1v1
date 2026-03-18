"use client";

import React from "react";

interface WaitingRoomProps {
  message?: string;
  description?: string;
}

export default function WaitingRoom({ 
  message = "Waiting for opponent...", 
  description = "Another player needs to join the room" 
}: WaitingRoomProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      {/* Animated grid */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-cyan-500/30 rounded-md animate-pulse"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1.5s",
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-cyan-400 animate-bounce shadow-lg shadow-cyan-500/50" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-white text-xl font-bold mb-2">
          {message}
        </h2>
        <p className="text-slate-400 text-sm">
          {description}
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
