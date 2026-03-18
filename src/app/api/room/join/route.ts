import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Match, MatchState, PlayerRole, Room } from "@/lib/types";
import { generateGrid } from "@/lib/gameLogic";

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

    const roomData = room as Room & { config: { creator_id?: string } };

    // 2. CHECK: If the player is the Host (Administrator)
    if (roomData.config.creator_id === playerIdentifier) {
      // Find the most recent active match to watch
      const { data: latestMatch } = await supabase
        .from("gb_matches")
        .select("*")
        .eq("room_id", roomData.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      return NextResponse.json({ 
        match: latestMatch, 
        role: "Observer" 
      });
    }

    // 3. Check if player is already in a match for this room
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

    // 4. Matchmaking (find "waiting" match)
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

    // 5. Create new match as Alice
    const s_value = roomData.config.sList[Math.floor(Math.random() * roomData.config.sList.length)];
    const grid = generateGrid(
      roomData.config.N,
      roomData.config.M,
      roomData.config.p,
      roomData.config.q,
      s_value
    );

    const initialState: MatchState = {
      grid,
      removed: Array.from({ length: roomData.config.N }, () => Array(roomData.config.M).fill(false)),
      pos: null,
    };

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
    return NextResponse.json({ message: "Failed to join room" }, { status: 500 });
  }
}
