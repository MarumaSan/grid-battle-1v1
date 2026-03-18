import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { applyMove, getValidMoves } from "@/lib/gameLogic";
import { Direction, Match } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { matchId, direction, playerIdentifier } = (await req.json()) as { 
      matchId: string; 
      direction: Direction;
      playerIdentifier: string 
    };

    // 1. Find match
    const { data: matchData, error: matchError } = await supabase
      .from("gb_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !matchData) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    const match = matchData as any; // Cast for now

    // 2. Validate move authority
    const role = match.alice_id === playerIdentifier ? "Alice" : "Bob";
    if (match.currentPlayer !== role) {
      return NextResponse.json({ message: "Not your turn" }, { status: 403 });
    }

    // 3. Apply move
    // Build a match object for the pure game logic
    const matchObj = {
      ...match,
      grid: match.state.grid,
      removed: match.state.removed,
      pos: match.state.pos,
      moveCount: match.move_count,
    } as any;

    try {
      const updatedMatch = applyMove(matchObj, direction);
      
      // 4. Update Supabase
      const { data: finalMatch, error: updateError } = await supabase
        .from("gb_matches")
        .update({
          state: {
            grid: updatedMatch.grid,
            removed: updatedMatch.removed,
            pos: updatedMatch.pos,
          },
          currentPlayer: updatedMatch.currentPlayer,
          status: updatedMatch.status,
          winner: updatedMatch.winner,
          move_count: updatedMatch.moveCount,
        })
        .eq("id", matchId)
        .select()
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ match: finalMatch });
    } catch (moveErr) {
      return NextResponse.json({ message: (moveErr as Error).message }, { status: 400 });
    }
  } catch (error) {
    console.error("[API Move]", error);
    return NextResponse.json({ message: "Failed to process move" }, { status: 500 });
  }
}
