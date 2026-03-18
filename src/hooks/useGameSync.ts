"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Match, PlayerRole, Room } from "@/lib/types";
import { nanoid } from "nanoid";

export function useGameSync() {
  const [playerIdentifier, setPlayerIdentifier] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("gb_player_id");
    if (!id) {
      id = nanoid();
      localStorage.setItem("gb_player_id", id);
    }
    setPlayerIdentifier(id);
  }, []);

  const createRoom = useCallback(async (config: any) => {
    const res = await fetch("/api/room/create", {
      method: "POST",
      body: JSON.stringify({ config }),
    });
    const { roomId } = await res.json();
    return roomId;
  }, []);

  const joinRoom = useCallback(async (roomId: string) => {
    if (!playerIdentifier) return null;
    const res = await fetch("/api/room/join", {
      method: "POST",
      body: JSON.stringify({ roomId, playerIdentifier }),
    });
    if (!res.ok) throw new Error("Join failed");
    return await res.json();
  }, [playerIdentifier]);

  const placePawn = useCallback(async (matchId: string, pos: { x: number; y: number }) => {
    if (!playerIdentifier) return;
    await fetch("/api/match/place", {
      method: "POST",
      body: JSON.stringify({ matchId, pos, playerIdentifier }),
    });
  }, [playerIdentifier]);

  const move = useCallback(async (matchId: string, direction: string) => {
    if (!playerIdentifier) return;
    await fetch("/api/match/move", {
      method: "POST",
      body: JSON.stringify({ matchId, direction, playerIdentifier }),
    });
  }, [playerIdentifier]);

  return {
    playerIdentifier,
    createRoom,
    joinRoom,
    placePawn,
    move,
  };
}
