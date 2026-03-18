import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";
import { RoomConfig } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { config } = (await req.json()) as { config: RoomConfig };
    
    // Generate room code (6 chars)
    const room_code = nanoid(6).toUpperCase();
    
    const { data, error } = await supabase
      .from("gb_rooms")
      .insert([
        {
          room_code,
          config,
          status: "waiting",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ roomId: room_code });
  } catch (error) {
    console.error("[API Create Room]", error);
    return NextResponse.json({ message: "Failed to create room" }, { status: 500 });
  }
}
