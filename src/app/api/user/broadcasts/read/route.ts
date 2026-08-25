import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder_service_role_key";
const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { broadcastId, studentId } = body;

    if (!broadcastId || !studentId) {
      return NextResponse.json({ error: "Broadcast ID and Student ID are required." }, { status: 400 });
    }

    try {
      await supabaseServer
        .from("broadcast_receipts")
        .upsert(
          {
            broadcast_id: broadcastId,
            student_id: studentId,
            read_at: new Date().toISOString()
          },
          { onConflict: "broadcast_id,student_id" }
        );
    } catch {}

    return NextResponse.json({ success: true, message: "Receipt confirmed." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed updating read receipt." }, { status: 500 });
  }
}
