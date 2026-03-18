"use client";

import { useCallback, useEffect, useState } from "react";
import { Match, Position, Direction, PlayerRole, RoomConfig } from "@/lib/types";
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

  const createRoom = useCallback(async (config: RoomConfig) => {
    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to create room");
    }
    return data as { roomId: string };
  }, []);

  const joinRoom = useCallback(async (roomCode: string) => {
    if (!playerIdentifier) return null;

    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode, playerIdentifier }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Join failed");
    }
    return data as { match: Match; role: PlayerRole };
  }, [playerIdentifier]);

  const placePawn = useCallback(async (matchId: string, pos: Position) => {
    const res = await fetch("/api/match/place", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, pos }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Placement failed");
    }
    return data as { match: Match };
  }, []);

  const move = useCallback(async (matchId: string, direction: Direction) => {
    const res = await fetch("/api/match/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, direction }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Move failed");
    }
    return data as { match: Match };
  }, []);

  return {
    playerIdentifier,
    createRoom,
    joinRoom,
    placePawn,
    move,
  };
}
