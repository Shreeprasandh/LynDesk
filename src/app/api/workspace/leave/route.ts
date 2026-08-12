import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workspaceId, workspaceUuid, userId } = body;

    if (!userId || (!workspaceId && !workspaceUuid)) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dsqkxedafwzkjtcupzwx.supabase.co";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const targetSpaceIds = [workspaceId, workspaceUuid].filter(Boolean);

    // 1. Delete member from project_members table for all target space IDs
    for (const spaceId of targetSpaceIds) {
      await supabaseAdmin
        .from("project_members")
        .delete()
        .eq("project_space_id", spaceId)
        .eq("profile_id", userId);
    }

    // 2. Broadcast member_left event via WebSockets Realtime bus
    try {
      const activeSpaceId = workspaceUuid || workspaceId;
      const channel = supabaseAdmin.channel(`project_chat:${activeSpaceId}`);
      await channel.subscribe();
      await channel.send({
        type: "broadcast",
        event: "member_left",
        payload: { userId, workspaceId: activeSpaceId }
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/workspace/leave:", error);
    return NextResponse.json({ error: error.message || "Failed to leave workspace" }, { status: 500 });
  }
}
