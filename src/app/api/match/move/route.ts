import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Match, Direction, PlayerRole, MatchStatus } from "@/lib/types";
import { getTargetPosition, canMove } from "@/lib/gameLogic";

export async function POST(req: Request) {
  try {
    const { matchId, direction } = (await req.json()) as { matchId: string, direction: Direction };

    // 1. Get current match
    const { data: match, error: fetchError } = await supabase
      .from("gb_matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (fetchError || !match) throw fetchError || new Error("Match not found");
    
    const matchData = match as Match;

    // 2. Validate move
    if (matchData.status !== "playing") throw new Error("Incorrect state");
    if (!matchData.state.pos) throw new Error("No pawn on grid");

    // Calculate move
    const nextPos = getTargetPosition(matchData.state.pos, direction);
    
    // Check if move is valid
    if (
      nextPos.x < 0 || nextPos.x >= matchData.state.grid.length ||
      nextPos.y < 0 || nextPos.y >= matchData.state.grid[0].length ||
      !matchData.state.grid[nextPos.x][nextPos.y] ||
      matchData.state.removed[nextPos.x][nextPos.y]
    ) {
      throw new Error("Invalid move");
    }

    // 3. Execute move
    const newState = { ...matchData.state };
    newState.pos = nextPos;
    newState.removed[nextPos.x][nextPos.y] = true;

    const nextPlayer: PlayerRole = matchData.current_player === "Alice" ? "Bob" : "Alice";
    const canNextMove = canMove(nextPos, matchData.state.grid, newState.removed);
    
    let nextStatus: MatchStatus = matchData.status;
    let winner: PlayerRole | null = null;

    if (!canNextMove) {
      nextStatus = "finished";
      winner = matchData.current_player; 
    }

    // 4. Update match
    const { data: updatedMatch, error: updateError } = await supabase
      .from("gb_matches")
      .update({
        state: newState,
        current_player: nextPlayer,
        status: nextStatus,
        winner: winner,
        move_count: matchData.move_count + 1,
      })
      .eq("id", matchId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ match: updatedMatch });
  } catch (error: any) {
    console.error("[API Match Move]", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
