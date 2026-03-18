"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import GameGrid from "@/components/GameGrid";
import PlayerInfo from "@/components/PlayerInfo";
import WaitingRoom from "@/components/WaitingRoom";
import GameOverModal from "@/components/GameOverModal";
import type { Match, PlayerRole, Position, Direction } from "@/lib/types";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const roomId = params.slug as string;

  const [status, setStatus] = useState<"connecting" | "waiting" | "playing" | "finished" | "error" | "closed">("connecting");
  const [match, setMatch] = useState<Match | null>(null);
  const [role, setRole] = useState<PlayerRole | null>(null);
  const [winner, setWinner] = useState<PlayerRole | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!socket) return;

    // Join the room
    socket.emit("join-room", { roomId });

    socket.on("waiting-for-opponent", () => {
      setStatus("waiting");
    });

    socket.on("match-started", ({ match: m, role: r }) => {
      setMatch(m);
      setRole(r);
      setStatus("playing");
    });

    socket.on("match-updated", ({ match: m }) => {
      setMatch(m);
    });

    socket.on("game-over", ({ winner: w, match: m }) => {
      setMatch(m);
      setWinner(w);
      setStatus("finished");
    });

    socket.on("room-closed", () => {
      setStatus("closed");
    });

    socket.on("error", ({ message }) => {
      setErrorMsg(message);
      setStatus("error");
    });

    return () => {
      socket.off("waiting-for-opponent");
      socket.off("match-started");
      socket.off("match-updated");
      socket.off("game-over");
      socket.off("room-closed");
      socket.off("error");
    };
  }, [socket, roomId]);

  const handlePlacePawn = (pos: Position) => {
    if (!socket || !match) return;
    socket.emit("place-pawn", { matchId: match.matchId, pos });
  };

  const handleMove = (direction: Direction) => {
    if (!socket || !match) return;
    socket.emit("move", { matchId: match.matchId, direction });
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            Grid Battle 1v1
          </h1>
          <p className="text-gray-500 text-xs font-mono mt-1">Room: {roomId}</p>
        </div>

        {/* Connecting */}
        {status === "connecting" && (
          <div className="text-gray-400 animate-pulse">Connecting to room...</div>
        )}

        {/* Waiting */}
        {status === "waiting" && <WaitingRoom />}

        {/* Playing / Placing */}
        {(status === "playing") && match && role && (
          <>
            <PlayerInfo
              role={role}
              currentPlayer={match.currentPlayer}
              moveCount={match.moveCount}
              status={match.status}
            />
            <GameGrid
              match={match}
              role={role}
              onPlacePawn={handlePlacePawn}
              onMove={handleMove}
            />
          </>
        )}

        {/* Game Over */}
        {status === "finished" && winner && match && role && (
          <>
            <PlayerInfo
              role={role}
              currentPlayer={match.currentPlayer}
              moveCount={match.moveCount}
              status={match.status}
            />
            <GameGrid
              match={match}
              role={role}
              onPlacePawn={handlePlacePawn}
              onMove={handleMove}
            />
            <GameOverModal
              winner={winner}
              role={role}
              moveCount={match.moveCount}
              onClose={() => router.push("/")}
            />
          </>
        )}

        {/* Room Closed */}
        {status === "closed" && (
          <div className="text-center p-8 rounded-2xl bg-red-500/10 border border-red-500/20">
            <div className="text-4xl mb-4">🚫</div>
            <h2 className="text-white text-xl font-bold mb-2">Room Closed</h2>
            <p className="text-gray-400 mb-4">The host has closed this room.</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="text-center p-8 rounded-2xl bg-red-500/10 border border-red-500/20">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-bold mb-2">Error</h2>
            <p className="text-red-300 mb-4">{errorMsg}</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
