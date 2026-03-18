import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isValidPlacement, getValidMoves } from "@/lib/gameLogic";
import { Position } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { matchId, pos, playerIdentifier } = (await req.json()) as { 
      matchId: string; 
      pos: Position;
      playerIdentifier: string 
    };

    const { data: matchData, error: matchError } = await supabase
      .from("gb_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !matchData) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    const match = matchData as any;

    if (match.alice_id !== playerIdentifier) {
      return NextResponse.json({ message: "Only Alice can place the pawn" }, { status: 403 });
    }

    if (match.status !== "placing") {
      return NextResponse.json({ message: "Not in placement phase" }, { status: 400 });
    }

    if (!isValidPlacement(match.state.grid, pos)) {
      return NextResponse.json({ message: "Invalid placement" }, { status: 400 });
    }

    // Update match state
    let status = "playing";
    let winner = null;

    // Check if Bob has any valid moves
    const validMoves = getValidMoves(match.state.grid, match.state.removed, pos);
    if (validMoves.length === 0) {
      status = "finished";
      winner = "Alice";
    }

    const { data: finalMatch, error: updateError } = await supabase
      .from("gb_matches")
      .update({
        state: { ...match.state, pos },
        status,
        currentPlayer: "Bob",
        winner,
      })
      .eq("id", matchId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ match: finalMatch });
  } catch (error) {
    console.error("[API Place Pawn]", error);
    return NextResponse.json({ message: "Failed to place pawn" }, { status: 500 });
  }
}
