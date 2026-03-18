import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { nanoid } from "nanoid";
import { RoomConfig } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { config } = (await req.json()) as { config: RoomConfig };
    
    // Generate room code (6 chars)
    const room_code = nanoid(6).toUpperCase();
    
    console.log("[API Create Room] Creating room:", room_code, config);

    const { data, error } = await supabase
      .from("gb_rooms")
      .insert([
        {
          room_code,
          config, // Supabase JS handles objects for jsonb
          status: "waiting",
        },
      ])
      .select()
      .maybeSingle(); // maybeSingle is safer for logging

    if (error) {
      console.error("[API Create Room] Supabase Error:", error);
      return NextResponse.json({ message: error.message, details: error.details }, { status: 500 });
    }

    if (!data) {
      console.error("[API Create Room] No data returned from insert");
      return NextResponse.json({ message: "No data returned from insert" }, { status: 500 });
    }

    return NextResponse.json({ roomId: room_code });
  } catch (error: any) {
    console.error("[API Create Room] Server Error:", error);
    return NextResponse.json({ message: error.message || "Failed to create room" }, { status: 500 });
  }
}
