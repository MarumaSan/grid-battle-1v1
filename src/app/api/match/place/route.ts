import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Match, Position, MatchStatus, PlayerRole } from "@/lib/types";
import { isValidPlacement, canMove } from "@/lib/gameLogic";

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

    // 2. Validate state
    if (matchData.status !== "placing") throw new Error("Incorrect state");
    if (!isValidPlacement(matchData.state.grid, pos)) {
      throw new Error("Invalid placement: cell is not available");
    }

    // 3. Update state
    const newState = { ...matchData.state };
    newState.pos = pos;
    newState.removed[pos.x][pos.y] = true; // Mark starting cell as used

    // Check if next player (Bob) can move from this position
    const canBobMove = canMove(pos, matchData.state.grid, newState.removed);
    
    let nextStatus: MatchStatus = "playing";
    let winner: PlayerRole | null = null;

    if (!canBobMove) {
      nextStatus = "finished";
      winner = "Alice"; // Alice placed it, Bob has no moves -> Alice wins
    }

    // 4. Persistence
    const { data: updatedMatch, error: updateError } = await supabase
      .from("gb_matches")
      .update({
        state: newState,
        status: nextStatus,
        winner: winner,
        current_player: "Bob", 
        move_count: 1,
      })
      .eq("id", matchId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ match: updatedMatch });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place pawn";
    return NextResponse.json({ message }, { status: 500 });
  }
}
