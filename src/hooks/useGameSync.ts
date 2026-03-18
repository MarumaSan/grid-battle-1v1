"use client";

import { useCallback, useEffect, useState } from "react";
import { Match, Position, Direction, PlayerRole } from "@/lib/types";
import { nanoid } from "nanoid";

export function useGameSync() {
  const [playerIdentifier, setPlayerIdentifier] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("gb_player_id");
    if (!id) {
      id = nanoid(10);
      localStorage.setItem("gb_player_id", id);
    }
    setPlayerIdentifier(id);
  }, []);

  const joinRoom = useCallback(async (roomCode: string) => {
    if (!playerIdentifier) return null;

    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode, playerIdentifier }),
    });

    if (!res.ok) throw new Error("Join failed");
    return res.json() as Promise<{ match: Match; role: PlayerRole }>;
  }, [playerIdentifier]);

  const placePawn = useCallback(async (matchId: string, pos: Position) => {
    const res = await fetch("/api/match/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, pos }),
    });

    if (!res.ok) throw new Error("Placement failed");
    return res.json() as Promise<{ match: Match }>;
  }, []);

  const move = useCallback(async (matchId: string, direction: Direction) => {
    const res = await fetch("/api/match/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, direction }),
    });

    if (!res.ok) throw new Error("Move failed");
    return res.json() as Promise<{ match: Match }>;
  }, []);

  return {
    playerIdentifier,
    joinRoom,
    placePawn,
    move,
  };
}
