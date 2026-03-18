import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateGrid } from "@/lib/gameLogic";
import { PlayerRole } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { roomId: roomCode, playerIdentifier } = (await req.json()) as { 
      roomId: string; 
      playerIdentifier: string 
    };

    // 1. Find the room
    const { data: room, error: roomError } = await supabase
      .from("gb_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    // 2. Check for an open match in this room
    const { data: openMatch, error: matchError } = await supabase
      .from("gb_matches")
      .select("*")
      .eq("room_id", room.id)
      .eq("status", "waiting_for_opponent")
      .single();

    if (openMatch) {
      // Pair with open match as Bob
      const { data: startedMatch, error: updateError } = await supabase
        .from("gb_matches")
        .update({
          bob_id: playerIdentifier,
          status: "placing", // Bob joined, Alice can now place
        })
        .eq("id", openMatch.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ 
        role: "Bob", 
        matchId: startedMatch.id, 
        match: startedMatch 
      });
    }

    // 3. Create a new match and wait for opponent
    const s = room.config.sList[Math.floor(Math.random() * room.config.sList.length)];
    const grid = generateGrid(room.config.N, room.config.M, room.config.p, room.config.q, s);
    const removed = Array.from({ length: room.config.N }, () =>
      Array.from({ length: room.config.M }, () => false)
    );

    const { data: newMatch, error: createError } = await supabase
      .from("gb_matches")
      .insert([
        {
          room_id: room.id,
          alice_id: playerIdentifier,
          bob_id: null,
          status: "waiting_for_opponent",
          state: {
            grid,
            removed,
            pos: null,
          },
          s,
          currentPlayer: "Alice",
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({ 
      role: "Alice", 
      matchId: newMatch.id, 
      match: newMatch 
    });
  } catch (error) {
    console.error("[API Join Room]", error);
    return NextResponse.json({ message: "Failed to join room" }, { status: 500 });
  }
}
