import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Match, Position } from "@/lib/types";
import { isValidPlacement } from "@/lib/gameLogic";

export async function POST(req: Request) {
  try {
    const { matchId, pos } = (await req.json()) as { matchId: string, pos: Position };

    // 1. Get current match
    const { data: match, error: fetchError } = await supabase
      .from("gb_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (fetchError || !match) throw fetchError || new Error("Match not found");
    
    const matchData = match as Match;

    // 2. Validate move
    if (matchData.status !== "placing") throw new Error("Incorrect state");
    
    // Check if placement is valid (on an available cell)
    if (!isValidPlacement(matchData.state.grid, pos)) {
      throw new Error("Invalid placement: cell is not available");
    }

    // 3. Mark cell as occupied
    const newState = { ...matchData.state };
    newState.pos = pos;
    newState.removed[pos.x][pos.y] = true;

    // 4. Update match
    const { data: updatedMatch, error: updateError } = await supabase
      .from("gb_matches")
      .update({
        state: newState,
        status: "playing",
        current_player: "Bob", // Bob always goes after Alice places
        move_count: 1,
      })
      .eq("id", matchId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ match: updatedMatch });
  } catch (error: any) {
    console.error("[API Match Place]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
