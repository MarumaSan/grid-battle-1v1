import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Match, MatchState, PlayerRole, Room } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { roomCode, playerIdentifier } = await req.json();

    // 1. Find the room
    const { data: room, error: roomError } = await supabase
      .from("gb_rooms")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const roomData = room as Room;

    // 2. Check if player is already in a match for this room
    const { data: existingMatch } = await supabase
      .from("gb_matches")
      .select("*")
      .eq("room_id", roomData.id)
      .or(`alice_id.eq.${playerIdentifier},bob_id.eq.${playerIdentifier}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingMatch && existingMatch.status !== "finished") {
      const role: PlayerRole = existingMatch.alice_id === playerIdentifier ? "Alice" : "Bob";
      return NextResponse.json({ match: existingMatch, role });
    }

    // 3. Matchmaking (find "waiting" match)
    const { data: waitingMatch } = await supabase
      .from("gb_matches")
      .select("*")
      .eq("room_id", roomData.id)
      .eq("status", "waiting_for_opponent")
      .is("bob_id", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (waitingMatch) {
      // Join as Bob
      const { data: joinedMatch, error: joinError } = await supabase
        .from("gb_matches")
        .update({
          bob_id: playerIdentifier,
          status: "placing",
        })
        .eq("id", waitingMatch.id)
        .select()
        .single();

      if (joinError) throw joinError;
      return NextResponse.json({ match: joinedMatch, role: "Bob" });
    }

    // 4. Create new match as Alice
    const s_value = roomData.config.sList[Math.floor(Math.random() * roomData.config.sList.length)];
    const initialState: MatchState = {
      grid: Array.from({ length: roomData.config.N }, () => Array(roomData.config.M).fill(true)),
      removed: Array.from({ length: roomData.config.N }, () => Array(roomData.config.M).fill(false)),
      pos: null,
    };

    // Apply (p^i + q^j) % s == 0
    for (let i = 0; i < roomData.config.N; i++) {
      for (let j = 0; j < roomData.config.M; j++) {
        const formulaValue = BigInt(Math.pow(roomData.config.p, i)) + BigInt(Math.pow(roomData.config.q, j));
        if (formulaValue % BigInt(s_value) === 0n) {
          initialState.grid[i][j] = false;
        }
      }
    }

    const { data: newMatch, error: createError } = await supabase
      .from("gb_matches")
      .insert([
        {
          room_id: roomData.id,
          alice_id: playerIdentifier,
          state: initialState,
          status: "waiting_for_opponent",
          s_value,
          current_player: "Alice",
          move_count: 0,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;
    return NextResponse.json({ match: newMatch, role: "Alice" });

  } catch (error) {
    console.error("[API Join Room]", error);
    return NextResponse.json({ message: "Failed to join room" }, { status: 500 });
  }
}
